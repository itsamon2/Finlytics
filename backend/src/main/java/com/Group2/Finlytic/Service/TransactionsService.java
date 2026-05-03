package com.Group2.Finlytic.Service;

import com.Group2.Finlytic.Model.TransactionAnalysis;
import com.Group2.Finlytic.Model.TransactionIntentResult;
import com.Group2.Finlytic.Model.Transactions;
import com.Group2.Finlytic.repo.Transactionsrepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TransactionsService {

    @Autowired
    private Transactionsrepo transactionsRepo;

    @Autowired
    private CategorizationService categorizationService;

    @Autowired
    private BudgetManagerService budgetManagerService;

    @Autowired
    private IntentService intentService;

    @Autowired
    private GoalEngineService goalEngineService;

    // ── Save transaction (manual entry, no AI needed) ────────────
    public Transactions saveTransaction(Transactions transaction) {
        if (transaction.getRawMessage() != null && !transaction.getRawMessage().isEmpty()) {
            TransactionAnalysis analysis = categorizationService.analyze(transaction.getRawMessage());
            transaction.setCategory(analysis.category());
            transaction.setAmount(analysis.amount());

            // Safe enum parsing with fallback
            try {
                transaction.setType(Transactions.TransactionType.valueOf(analysis.transactionType()));
            } catch (IllegalArgumentException e) {
                // AI returned something unexpected, infer from message
                String raw = transaction.getRawMessage().toLowerCase();
                transaction.setType(raw.contains("received")
                        ? Transactions.TransactionType.INCOME
                        : Transactions.TransactionType.EXPENSE);
            }
        }
        Transactions saved = transactionsRepo.save(transaction);
        budgetManagerService.updateBudgetFromTransaction(saved);
        return saved;
    }

    // ── Analyze SMS + save + attempt goal match ───────────────────
    public Map<String, Object> analyzeAndSave(String rawMessage, Long userId) {

        // 1. Duplicate check using existsBy (no need to fetch the full object)
        String mpesaCode = extractMpesaCode(rawMessage);

        if (mpesaCode != null && transactionsRepo.existsByMpesaCodeAndUserId(mpesaCode, userId)) {
            return Map.of(
                    "duplicate", true,
                    "message",   "Transaction already recorded"
            );
        }

        // 2. Run AI + rule-based intent detection
        TransactionIntentResult result = intentService.processTransaction(rawMessage, userId);
        TransactionAnalysis analysis = result.analysis();

        // 3. Persist the transaction immediately
        Transactions tx = new Transactions();
        tx.setUserId(userId);
        tx.setRawMessage(rawMessage);
        tx.setAmount(analysis.amount());
        tx.setCategory(analysis.category());
        tx.setIntent(analysis.intent());
        tx.setMpesaCode(mpesaCode);
        tx.setType(Transactions.TransactionType.valueOf(
                analysis.transactionType().toUpperCase()));

        // 4. If a goal was silently matched, stamp it on the transaction
        if (result.matchedGoalId() != null) {
            tx.setGoalId(result.matchedGoalId());
        }

        Transactions saved = transactionsRepo.save(tx);
        budgetManagerService.updateBudgetFromTransaction(saved);

        // 5. Build response — tells the APK whether to show a popup
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("transactionId",          saved.getTransactionId());
        response.put("amount",                 saved.getAmount());
        response.put("category",               saved.getCategory());
        response.put("intent",                 saved.getIntent());
        response.put("isSaving",               result.isSaving());
        response.put("needsGoalClarification", result.needsGoalClarification());
        response.put("suggestedGoal",          result.suggestedGoalHint());
        response.put("matchedGoalId",          result.matchedGoalId());
        response.put("duplicate",              false);

        return response;
    }

    // ── Extracts the M-Pesa transaction code from raw SMS ────────
    private String extractMpesaCode(String rawMessage) {
        if (rawMessage == null) return null;
        java.util.regex.Matcher matcher = java.util.regex.Pattern
                .compile("\\b([A-Z0-9]{10})\\b")
                .matcher(rawMessage);
        return matcher.find() ? matcher.group(1) : null;
    }

    // ── Assign goal after user answers "what are you saving for?" ─
    public Map<String, Object> assignGoalToTransaction(Long transactionId,
                                                       Long userId,
                                                       String goalHint) {

        // 1. Verify the transaction belongs to this user
        Transactions tx = transactionsRepo
                .findByTransactionIdAndUserId(transactionId, userId)
                .orElseThrow(() -> new RuntimeException(
                        "Transaction not found or access denied"));

        // 2. Try to match an active goal using the user's hint
        Long matchedGoalId = goalEngineService.processSaving(
                userId, tx.getAmount(), goalHint);

        Map<String, Object> response = new LinkedHashMap<>();

        if (matchedGoalId == null) {
            response.put("matched", false);
            response.put("message",
                    "No active goal matched '" + goalHint + "'. Would you like to create one?");
        } else {
            tx.setGoalId(matchedGoalId);
            transactionsRepo.save(tx);

            response.put("matched",       true);
            response.put("matchedGoalId", matchedGoalId);
            response.put("message",       "Contribution recorded successfully.");
        }

        return response;
    }

    // ── Fetch all transactions for a user ─────────────────────────
    public List<Transactions> getTransactionsByUserId(Long userId) {
        return transactionsRepo.findByUserId(userId);
    }

    public Optional<Transactions> getTransactionByIdAndUserId(Long id, Long userId) {
        return transactionsRepo.findByTransactionIdAndUserId(id, userId);
    }

    public List<Transactions> getTransactionsByCategoryAndUserId(String category, Long userId) {
        return transactionsRepo.findByCategoryAndUserId(category, userId);
    }

    public BigDecimal getMonthlyIncome(Long userId) {
        LocalDate start = LocalDate.now().withDayOfMonth(1);
        LocalDate end   = start.plusMonths(1);
        return transactionsRepo.findCurrentMonthIncome(userId, start, end).stream()
                .map(Transactions::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public Map<String, BigDecimal> getMonthlyExpensesByCategory(Long userId) {
        LocalDate start = LocalDate.now().withDayOfMonth(1);
        LocalDate end   = start.plusMonths(1);
        return transactionsRepo.findCurrentMonthExpenses(userId, start, end).stream()
                .filter(t -> t.getCategory() != null)
                .collect(Collectors.groupingBy(
                        Transactions::getCategory,
                        Collectors.reducing(BigDecimal.ZERO,
                                Transactions::getAmount, BigDecimal::add)
                ));
    }

    public BigDecimal getTotalBalance(Long userId) {
        BigDecimal totalIncome = transactionsRepo.findAllIncome(userId).stream()
                .map(Transactions::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalExpenses = transactionsRepo.findAllExpenses(userId).stream()
                .map(Transactions::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return totalIncome.subtract(totalExpenses);
    }

    public BigDecimal getLastMonthIncome(Long userId) {
        LocalDate start = LocalDate.now().minusMonths(1).withDayOfMonth(1);
        LocalDate end   = LocalDate.now().withDayOfMonth(1);
        return transactionsRepo.findLastMonthIncome(userId, start, end).stream()
                .map(Transactions::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal getLastMonthExpenses(Long userId) {
        LocalDate start = LocalDate.now().minusMonths(1).withDayOfMonth(1);
        LocalDate end   = LocalDate.now().withDayOfMonth(1);
        return transactionsRepo.findLastMonthExpenses(userId, start, end).stream()
                .map(Transactions::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public List<Transactions> getTransactionsByMonth(Long userId, int month, int year) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end   = start.plusMonths(1);
        return transactionsRepo.findByMonthAndYear(userId, start, end);
    }

    public List<Map<String, Object>> getMonthlyCashflow(Long userId) {
        List<Transactions> transactions = transactionsRepo.findLast12MonthsTransactions(
                userId, LocalDate.now().minusMonths(12));

        Map<String, BigDecimal> incomeByMonth  = new LinkedHashMap<>();
        Map<String, BigDecimal> expenseByMonth = new LinkedHashMap<>();

        transactions.forEach(t -> {
            String key = t.getCreationDate()
                    .getMonth()
                    .getDisplayName(TextStyle.SHORT, Locale.ENGLISH)
                    + " " + t.getCreationDate().getYear();

            if (t.getType() == Transactions.TransactionType.INCOME) {
                incomeByMonth.merge(key, t.getAmount(), BigDecimal::add);
            } else {
                expenseByMonth.merge(key, t.getAmount(), BigDecimal::add);
            }
        });

        Set<String> allMonths = new LinkedHashSet<>();
        allMonths.addAll(incomeByMonth.keySet());
        allMonths.addAll(expenseByMonth.keySet());

        return allMonths.stream().map(month -> {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("month",    month);
            entry.put("income",   incomeByMonth.getOrDefault(month, BigDecimal.ZERO));
            entry.put("expenses", expenseByMonth.getOrDefault(month, BigDecimal.ZERO));
            return entry;
        }).collect(Collectors.toList());
    }

    public Map<String, Object> getDashboardSummary(Long userId) {
        BigDecimal thisMonthIncome   = getMonthlyIncome(userId);
        BigDecimal thisMonthExpenses = getMonthlyExpensesByCategory(userId).values()
                .stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal lastMonthIncome   = getLastMonthIncome(userId);
        BigDecimal lastMonthExpenses = getLastMonthExpenses(userId);
        BigDecimal totalBalance      = getTotalBalance(userId);

        BigDecimal savingsRate = thisMonthIncome.compareTo(BigDecimal.ZERO) > 0
                ? thisMonthIncome.subtract(thisMonthExpenses)
                .divide(thisMonthIncome, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;

        BigDecimal incomeTrend  = calculateTrend(lastMonthIncome, thisMonthIncome);
        BigDecimal expenseTrend = calculateTrend(lastMonthExpenses, thisMonthExpenses);
        BigDecimal balanceTrend = calculateTrend(
                lastMonthIncome.subtract(lastMonthExpenses),
                thisMonthIncome.subtract(thisMonthExpenses));

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalBalance",    totalBalance);
        summary.put("monthlyIncome",   thisMonthIncome);
        summary.put("monthlyExpenses", thisMonthExpenses);
        summary.put("savingsRate",     savingsRate.setScale(1, RoundingMode.HALF_UP));
        summary.put("incomeTrend",     incomeTrend);
        summary.put("expenseTrend",    expenseTrend);
        summary.put("balanceTrend",    balanceTrend);
        return summary;
    }

    public void deleteTransactionByIdAndUserId(Long id, Long userId) {
        Transactions transaction = transactionsRepo
                .findByTransactionIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException(
                        "Transaction not found or access denied"));
        transactionsRepo.delete(transaction);
    }

    private BigDecimal calculateTrend(BigDecimal previous, BigDecimal current) {
        if (previous == null || previous.compareTo(BigDecimal.ZERO) == 0)
            return BigDecimal.ZERO;
        return current.subtract(previous)
                .divide(previous, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(1, RoundingMode.HALF_UP);
    }
}