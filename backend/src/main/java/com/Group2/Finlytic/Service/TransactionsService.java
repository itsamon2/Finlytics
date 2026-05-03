package com.Group2.Finlytic.Service;

import com.Group2.Finlytic.Model.TransactionAnalysis;
import com.Group2.Finlytic.Model.TransactionIntentResult;
import com.Group2.Finlytic.Model.Transactions;
import com.Group2.Finlytic.Model.User;
import com.Group2.Finlytic.repo.Transactionsrepo;
import com.Group2.Finlytic.repo.UserRepo;
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

    @Autowired
    private EncryptionService encryptionService;

    @Autowired
    private UserRepo userRepo;

    // ── Helper: get user's encryption key ────────────────────────
    private String getUserEncryptionKey(Long userId) {
        return userRepo.findById(userId)
                .map(User::getEncryptionKey)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

   public Transactions saveTransaction(Transactions transaction) {
    if (transaction.getRawMessage() != null &&
            !transaction.getRawMessage().isEmpty()) {

        TransactionAnalysis analysis =
                categorizationService.analyze(transaction.getRawMessage());

        transaction.setCategory(analysis.category());
        transaction.setAmount(analysis.amount());

        // Safe enum parsing with fallback
        try {
            transaction.setType(Transactions.TransactionType.valueOf(
                    analysis.transactionType().toUpperCase()));
        } catch (IllegalArgumentException e) {
            String raw = transaction.getRawMessage().toLowerCase();
            transaction.setType(raw.contains("received")
                    ? Transactions.TransactionType.INCOME
                    : Transactions.TransactionType.EXPENSE);
        }

        // Encrypt raw message before saving
        String encryptionKey = getUserEncryptionKey(transaction.getUserId());
        transaction.setRawMessage(
                encryptionService.encryptMessage(
                        transaction.getRawMessage(), encryptionKey));
    }

    // Ensure creationDate is always set for date-range queries
    if (transaction.getCreationDate() == null) {
        transaction.setCreationDate(LocalDate.now());
    }

    Transactions saved = transactionsRepo.save(transaction);
    budgetManagerService.updateBudgetFromTransaction(saved);
    return saved;
}

    // ── Analyze SMS + save + attempt goal match ───────────────────
    public Map<String, Object> analyzeAndSave(String rawMessage, Long userId) {

        // 1. Duplicate check
        String mpesaCode = extractMpesaCode(rawMessage);
        if (mpesaCode != null &&
                transactionsRepo.existsByMpesaCodeAndUserId(mpesaCode, userId)) {
            return Map.of(
                    "duplicate", true,
                    "message",   "Transaction already recorded"
            );
        }

        // 2. Run AI BEFORE encrypting — AI needs plain text
        TransactionIntentResult result   = intentService.processTransaction(rawMessage, userId);
        TransactionAnalysis     analysis = result.analysis();

        // 3. Encrypt raw message using user's unique key
        String encryptionKey    = getUserEncryptionKey(userId);
        String encryptedMessage = encryptionService.encryptMessage(rawMessage, encryptionKey);

        // 4. Persist the transaction with encrypted message
        Transactions tx = new Transactions();
        tx.setUserId(userId);
        tx.setRawMessage(encryptedMessage);
        tx.setAmount(analysis.amount());
        tx.setCategory(analysis.category());
        tx.setIntent(analysis.intent());
        tx.setMpesaCode(mpesaCode);
        tx.setType(Transactions.TransactionType.valueOf(
                analysis.transactionType().toUpperCase()));
        tx.setCreationDate(LocalDate.now());

        if (result.matchedGoalId() != null) {
            tx.setGoalId(result.matchedGoalId());
        }

        Transactions saved = transactionsRepo.save(tx);
        budgetManagerService.updateBudgetFromTransaction(saved);

        // 5. Build response
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

    // ── Extracts M-Pesa transaction code from raw SMS ─────────────
    private String extractMpesaCode(String rawMessage) {
        if (rawMessage == null) return null;
        java.util.regex.Matcher matcher = java.util.regex.Pattern
                .compile("\\b([A-Z0-9]{10})\\b")
                .matcher(rawMessage);
        return matcher.find() ? matcher.group(1) : null;
    }

    // ── Decrypt helper ────────────────────────────────────────────
    private void decryptTransaction(Transactions tx, String encryptionKey) {
        if (tx.getRawMessage() == null) return;
        try {
            tx.setRawMessage(
                    encryptionService.decryptMessage(tx.getRawMessage(), encryptionKey)
            );
        } catch (Exception e) {
            // Old unencrypted record — leave as is
        }
    }

    // ── Assign goal after user answers "what are you saving for?" ─
    public Map<String, Object> assignGoalToTransaction(Long transactionId,
                                                       Long userId,
                                                       String goalHint) {

        Transactions tx = transactionsRepo
                .findByTransactionIdAndUserId(transactionId, userId)
                .orElseThrow(() -> new RuntimeException(
                        "Transaction not found or access denied"));

        Long matchedGoalId = goalEngineService.processSaving(
                userId, tx.getAmount(), goalHint);

        Map<String, Object> response = new LinkedHashMap<>();

        if (matchedGoalId == null) {
            response.put("matched", false);
            response.put("message",
                    "No active goal matched '" + goalHint +
                            "'. Would you like to create one?");
        } else {
            tx.setGoalId(matchedGoalId);
            transactionsRepo.save(tx);
            response.put("matched",       true);
            response.put("matchedGoalId", matchedGoalId);
            response.put("message",       "Contribution recorded successfully.");
        }

        return response;
    }

    // ── Fetch all — decrypt for this user ─────────────────────────
    public List<Transactions> getTransactionsByUserId(Long userId) {
        String encryptionKey = getUserEncryptionKey(userId);
        return transactionsRepo.findByUserId(userId)
                .stream()
                .peek(tx -> decryptTransaction(tx, encryptionKey))
                .toList();
    }

    // ── Fetch single — decrypt for this user ──────────────────────
    public Optional<Transactions> getTransactionByIdAndUserId(Long id, Long userId) {
        String encryptionKey = getUserEncryptionKey(userId);
        return transactionsRepo.findByTransactionIdAndUserId(id, userId)
                .map(tx -> {
                    decryptTransaction(tx, encryptionKey);
                    return tx;
                });
    }

    // ── Fetch by category — decrypt for this user ─────────────────
    public List<Transactions> getTransactionsByCategoryAndUserId(
            String category, Long userId) {
        String encryptionKey = getUserEncryptionKey(userId);
        return transactionsRepo.findByCategoryAndUserId(category, userId)
                .stream()
                .peek(tx -> decryptTransaction(tx, encryptionKey))
                .toList();
    }

    // ── Monthly income ────────────────────────────────────────────
    public BigDecimal getMonthlyIncome(Long userId) {
        LocalDate start = LocalDate.now().withDayOfMonth(1);
        LocalDate end   = start.plusMonths(1);
        return transactionsRepo.findCurrentMonthIncome(userId, start, end).stream()
                .map(Transactions::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // ── Monthly expenses by category ──────────────────────────────
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

    // ── Total balance ─────────────────────────────────────────────
    public BigDecimal getTotalBalance(Long userId) {
        BigDecimal totalIncome = transactionsRepo.findAllIncome(userId).stream()
                .map(Transactions::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalExpenses = transactionsRepo.findAllExpenses(userId).stream()
                .map(Transactions::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return totalIncome.subtract(totalExpenses);
    }

    // ── Last month income ─────────────────────────────────────────
    public BigDecimal getLastMonthIncome(Long userId) {
        LocalDate start = LocalDate.now().minusMonths(1).withDayOfMonth(1);
        LocalDate end   = LocalDate.now().withDayOfMonth(1);
        return transactionsRepo.findLastMonthIncome(userId, start, end).stream()
                .map(Transactions::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // ── Last month expenses ───────────────────────────────────────
    public BigDecimal getLastMonthExpenses(Long userId) {
        LocalDate start = LocalDate.now().minusMonths(1).withDayOfMonth(1);
        LocalDate end   = LocalDate.now().withDayOfMonth(1);
        return transactionsRepo.findLastMonthExpenses(userId, start, end).stream()
                .map(Transactions::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // ── By month/year ─────────────────────────────────────────────
    public List<Transactions> getTransactionsByMonth(Long userId,
                                                     int month, int year) {
        LocalDate start      = LocalDate.of(year, month, 1);
        LocalDate end        = start.plusMonths(1);
        String encryptionKey = getUserEncryptionKey(userId);
        return transactionsRepo.findByMonthAndYear(userId, start, end)
                .stream()
                .peek(tx -> decryptTransaction(tx, encryptionKey))
                .toList();
    }

    // ── Monthly cashflow ──────────────────────────────────────────
    public List<Map<String, Object>> getMonthlyCashflow(Long userId) {
        List<Transactions> transactions = transactionsRepo
                .findLast12MonthsTransactions(
                        userId, LocalDate.now().minusMonths(12));

        Map<String, BigDecimal> incomeByMonth  = new LinkedHashMap<>();
        Map<String, BigDecimal> expenseByMonth = new LinkedHashMap<>();

        transactions.forEach(t -> {
            // FIX 2: Null-guard on creationDate to avoid NPE on legacy records
            if (t.getCreationDate() == null) return;

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

    // ── Dashboard summary ─────────────────────────────────────────
    public Map<String, Object> getDashboardSummary(Long userId) {
        BigDecimal thisMonthIncome   = getMonthlyIncome(userId);
        BigDecimal thisMonthExpenses = getMonthlyExpensesByCategory(userId)
                .values().stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal lastMonthIncome   = getLastMonthIncome(userId);
        BigDecimal lastMonthExpenses = getLastMonthExpenses(userId);
        BigDecimal totalBalance      = getTotalBalance(userId);

        BigDecimal savingsRate = thisMonthIncome.compareTo(BigDecimal.ZERO) > 0
                ? thisMonthIncome.subtract(thisMonthExpenses)
                .divide(thisMonthIncome, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;

        BigDecimal incomeTrend  = calculateTrend(lastMonthIncome,  thisMonthIncome);
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

    // ── Delete ────────────────────────────────────────────────────
    public void deleteTransactionByIdAndUserId(Long id, Long userId) {
        Transactions transaction = transactionsRepo
                .findByTransactionIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException(
                        "Transaction not found or access denied"));
        transactionsRepo.delete(transaction);
    }

    // ── Trend calculator ──────────────────────────────────────────
    private BigDecimal calculateTrend(BigDecimal previous, BigDecimal current) {
        if (previous == null || previous.compareTo(BigDecimal.ZERO) == 0)
            return BigDecimal.ZERO;
        return current.subtract(previous)
                .divide(previous, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(1, RoundingMode.HALF_UP);
    }
}