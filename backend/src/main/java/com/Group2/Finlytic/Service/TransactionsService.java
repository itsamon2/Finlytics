package com.Group2.Finlytic.Service;

import com.Group2.Finlytic.Model.TransactionAnalysis;
import com.Group2.Finlytic.Model.Transactions;
import com.Group2.Finlytic.repo.Transactionsrepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TransactionsService {

    @Autowired
    private Transactionsrepo transactionsrepo;

    @Autowired
    private CategorizationService categorizationService;

    @Autowired
    private BudgetManagerService budgetManagerService;

    // ── Existing methods (unchanged) ─────────────────────────────────────────

    public Transactions saveTransaction(Transactions transaction) {
        if (transaction.getRawMessage() != null && !transaction.getRawMessage().isEmpty()) {
            TransactionAnalysis analysis = categorizationService.analyze(transaction.getRawMessage());
            transaction.setCategory(analysis.category());
            transaction.setType(Transactions.TransactionType.valueOf(analysis.transactionType()));
            transaction.setAmount(analysis.amount());
        }
        Transactions saved = transactionsrepo.save(transaction);
        budgetManagerService.updateBudgetFromTransaction(saved);
        return saved;
    }

    public List<Transactions> getAllTransactions() {
        return transactionsrepo.findAll();
    }

    public Optional<Transactions> getTransactionById(Long transactionId) {
        return transactionsrepo.findById(transactionId);
    }

    public List<Transactions> getTransactionsByCategory(String category) {
        return transactionsrepo.findByCategory(category);
    }

    public void deleteTransaction(Long transactionId) {
        transactionsrepo.deleteById(transactionId);
    }

    public Map<String, BigDecimal> getMonthlyExpensesByCategory() {
        List<Transactions> expenses = transactionsrepo.findCurrentMonthExpenses();
        return expenses.stream()
                .filter(t -> t.getCategory() != null)
                .collect(Collectors.groupingBy(
                        Transactions::getCategory,
                        Collectors.reducing(BigDecimal.ZERO, Transactions::getAmount, BigDecimal::add)
                ));
    }

    public BigDecimal getMonthlyIncome() {
        return transactionsrepo.findCurrentMonthIncome().stream()
                .map(Transactions::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // ── New methods ───────────────────────────────────────────────────────────

    // Total balance — all income ever minus all expenses ever
    public BigDecimal getTotalBalance() {
        BigDecimal totalIncome = transactionsrepo.findAllIncome().stream()
                .map(Transactions::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalExpenses = transactionsrepo.findAllExpenses().stream()
                .map(Transactions::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return totalIncome.subtract(totalExpenses);
    }

    // Last month income — for trend
    public BigDecimal getLastMonthIncome() {
        return transactionsrepo.findLastMonthIncome().stream()
                .map(Transactions::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // Last month expenses — for trend
    public BigDecimal getLastMonthExpenses() {
        return transactionsrepo.findLastMonthExpenses().stream()
                .map(Transactions::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // Get transactions for a specific month and year
    public List<Transactions> getTransactionsByMonth(int month, int year) {
        return transactionsrepo.findByMonthAndYear(month, year);
    }

    // Monthly cashflow grouped by month — for the chart
    // Returns list of { month, income, expenses } for last 12 months
    public List<Map<String, Object>> getMonthlyCashflow() {
        List<Transactions> transactions = transactionsrepo.findLast12MonthsTransactions(
                java.time.LocalDate.now().minusMonths(12));

        // Group by "MMM yyyy" key e.g. "Jan 2026"
        Map<String, BigDecimal> incomeByMonth  = new LinkedHashMap<>();
        Map<String, BigDecimal> expenseByMonth = new LinkedHashMap<>();

        transactions.forEach(t -> {
            String key = t.getCreationDate().getMonth()
                    .getDisplayName(TextStyle.SHORT, Locale.ENGLISH)
                    + " " + t.getCreationDate().getYear();

            if (t.getType() == Transactions.TransactionType.INCOME) {
                incomeByMonth.merge(key, t.getAmount(), BigDecimal::add);
            } else {
                expenseByMonth.merge(key, t.getAmount(), BigDecimal::add);
            }
        });

        // Merge into unified list preserving order
        Set<String> allMonths = new LinkedHashSet<>();
        allMonths.addAll(incomeByMonth.keySet());
        allMonths.addAll(expenseByMonth.keySet());

        return allMonths.stream().map(month -> {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("month",    month);
            entry.put("income",   incomeByMonth.getOrDefault(month,  BigDecimal.ZERO));
            entry.put("expenses", expenseByMonth.getOrDefault(month, BigDecimal.ZERO));
            return entry;
        }).collect(Collectors.toList());
    }

    // Dashboard summary — single endpoint for all cards + trends
    public Map<String, Object> getDashboardSummary() {
        BigDecimal thisMonthIncome   = getMonthlyIncome();
        BigDecimal thisMonthExpenses = getMonthlyExpensesByCategory().values()
                .stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal lastMonthIncome   = getLastMonthIncome();
        BigDecimal lastMonthExpenses = getLastMonthExpenses();
        BigDecimal totalBalance      = getTotalBalance();

        // Savings rate — (income - expenses) / income * 100
        BigDecimal savingsRate = thisMonthIncome.compareTo(BigDecimal.ZERO) > 0
                ? thisMonthIncome.subtract(thisMonthExpenses)
                .divide(thisMonthIncome, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;

        // Trend helpers — percentage change vs last month
        // positive = increase, negative = decrease
        BigDecimal incomeTrend = calculateTrend(lastMonthIncome, thisMonthIncome);
        BigDecimal expenseTrend = calculateTrend(lastMonthExpenses, thisMonthExpenses);
        BigDecimal balanceTrend = calculateTrend(
                lastMonthIncome.subtract(lastMonthExpenses),
                thisMonthIncome.subtract(thisMonthExpenses)
        );

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalBalance",      totalBalance);
        summary.put("monthlyIncome",     thisMonthIncome);
        summary.put("monthlyExpenses",   thisMonthExpenses);
        summary.put("savingsRate",       savingsRate.setScale(1, RoundingMode.HALF_UP));
        summary.put("incomeTrend",       incomeTrend);
        summary.put("expenseTrend",      expenseTrend);
        summary.put("balanceTrend",      balanceTrend);
        return summary;
    }

    // % change from previous to current — returns signed percentage
    private BigDecimal calculateTrend(BigDecimal previous, BigDecimal current) {
        if (previous == null || previous.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return current.subtract(previous)
                .divide(previous, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(1, RoundingMode.HALF_UP);
    }
}