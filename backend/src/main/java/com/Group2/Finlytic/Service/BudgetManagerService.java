package com.Group2.Finlytic.Service;

import com.Group2.Finlytic.Model.BudgetHistory;
import com.Group2.Finlytic.Model.BudgetManager;
import com.Group2.Finlytic.Model.Transactions;
import com.Group2.Finlytic.repo.BudgetHistoryRepo;
import com.Group2.Finlytic.repo.BudgetManagerRepo;
import com.Group2.Finlytic.repo.Transactionsrepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class BudgetManagerService {

    @Autowired
    private BudgetManagerRepo budgetManagerRepo;

    @Autowired
    private BudgetHistoryRepo budgetHistoryRepo;

    @Autowired
    private Transactionsrepo transactionsrepo;

    // ── Existing methods ──────────────────────────────────────────────────────

    public BudgetManager saveBudget(BudgetManager budget) {
        int currentMonth = LocalDate.now().getMonthValue();
        int currentYear  = LocalDate.now().getYear();

        BigDecimal alreadySpent = transactionsrepo
                .findByMonthAndYear(currentMonth, currentYear)
                .stream()
                .filter(t -> t.getType() == Transactions.TransactionType.EXPENSE)
                .filter(t -> t.getCategory() != null &&
                        t.getCategory().equalsIgnoreCase(budget.getCategory()))
                .map(Transactions::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        budget.setAmountSpent(alreadySpent);
        return budgetManagerRepo.save(budget);
    }

    public List<BudgetManager> getAllBudgets() {
        return budgetManagerRepo.findAll();
    }

    public Optional<BudgetManager> getBudgetById(Long budgetId) {
        return budgetManagerRepo.findById(budgetId);
    }

    public List<BudgetManager> getBudgetsByCategory(String category) {
        return budgetManagerRepo.findByCategory(category);
    }

    public Optional<BudgetManager> updateAmountSpent(Long budgetId, BigDecimal amount) {
        return budgetManagerRepo.findById(budgetId).map(budget -> {
            budget.setAmountSpent(budget.getAmountSpent().add(amount));
            return budgetManagerRepo.save(budget);
        });
    }

    public Optional<BudgetManager> updateBudget(Long budgetId, BudgetManager updatedBudget) {
        return budgetManagerRepo.findById(budgetId).map(existing -> {
            existing.setCategory(updatedBudget.getCategory());
            existing.setBudgetLimit(updatedBudget.getBudgetLimit());
            existing.setColor(updatedBudget.getColor());
            existing.setBudgetPeriod(updatedBudget.getBudgetPeriod());
            return budgetManagerRepo.save(existing);
        });
    }

    public void updateBudgetFromTransaction(Transactions transaction) {
        if (transaction.getType() == Transactions.TransactionType.EXPENSE) {
            budgetManagerRepo.findFirstByCategoryIgnoreCase(transaction.getCategory())
                    .ifPresent(budget -> {
                        budget.setAmountSpent(budget.getAmountSpent().add(transaction.getAmount()));
                        budgetManagerRepo.save(budget);
                    });
        }
    }

    public boolean isBudgetExceeded(Long budgetId) {
        return budgetManagerRepo.findById(budgetId)
                .map(budget -> budget.getAmountSpent().compareTo(budget.getBudgetLimit()) > 0)
                .orElse(false);
    }

    public void deleteBudget(Long budgetId) {
        budgetManagerRepo.deleteById(budgetId);
    }

    // ── New methods ───────────────────────────────────────────────────────────

    public boolean isRolloverNeeded() {
        int currentMonth = LocalDate.now().getMonthValue();
        int currentYear  = LocalDate.now().getYear();

        if (budgetHistoryRepo.existsByMonthAndYear(currentMonth, currentYear)) {
            return false;
        }

        List<BudgetManager> budgets = budgetManagerRepo.findAll();
        if (budgets.isEmpty()) return false;

        return budgets.stream().anyMatch(b ->
                b.getCreationDate() != null &&
                        (b.getCreationDate().getMonthValue() < currentMonth ||
                                b.getCreationDate().getYear() < currentYear)
        );
    }

    public void rolloverBudgets(boolean continueWithSame) {
        int previousMonth = LocalDate.now().minusMonths(1).getMonthValue();
        int previousYear  = LocalDate.now().minusMonths(1).getYear();
        int currentMonth  = LocalDate.now().getMonthValue();
        int currentYear   = LocalDate.now().getYear();

        List<BudgetManager> budgets = budgetManagerRepo.findAll();

        if (!budgetHistoryRepo.existsByMonthAndYear(previousMonth, previousYear)) {
            budgets.forEach(budget -> {
                BudgetHistory snapshot = new BudgetHistory();
                snapshot.setCategory(budget.getCategory());
                snapshot.setBudgetLimit(budget.getBudgetLimit());
                snapshot.setAmountSpent(budget.getAmountSpent());
                snapshot.setColor(budget.getColor());
                snapshot.setBudgetPeriod(
                        budget.getBudgetPeriod() != null
                                ? budget.getBudgetPeriod().name()
                                : "MONTHLY"
                );
                snapshot.setMonth(previousMonth);
                snapshot.setYear(previousYear);
                snapshot.setSnapshotDate(LocalDate.now());
                budgetHistoryRepo.save(snapshot);
            });
        }

        if (!budgetHistoryRepo.existsByMonthAndYear(currentMonth, currentYear)) {
            BudgetHistory placeholder = new BudgetHistory();
            placeholder.setCategory("__ROLLOVER_MARKER__");
            placeholder.setBudgetLimit(BigDecimal.ZERO);
            placeholder.setAmountSpent(BigDecimal.ZERO);
            placeholder.setMonth(currentMonth);
            placeholder.setYear(currentYear);
            placeholder.setSnapshotDate(LocalDate.now());
            budgetHistoryRepo.save(placeholder);
        }

        if (continueWithSame) {
            budgets.forEach(budget -> {
                budget.setAmountSpent(BigDecimal.ZERO);
                budgetManagerRepo.save(budget);
            });
        }
    }

    public Map<String, Object> getBudgetsByMonth(int month, int year) {
        int currentMonth = LocalDate.now().getMonthValue();
        int currentYear  = LocalDate.now().getYear();

        boolean isCurrentMonth = (month == currentMonth && year == currentYear);

        if (isCurrentMonth) {
            return Map.of(
                    "isCurrentMonth", true,
                    "budgets", budgetManagerRepo.findAll()
            );
        } else {
            List<BudgetHistory> history = budgetHistoryRepo.findByMonthAndYear(month, year)
                    .stream()
                    .filter(h -> !h.getCategory().equals("__ROLLOVER_MARKER__"))
                    .toList();
            return Map.of(
                    "isCurrentMonth", false,
                    "budgets", history
            );
        }
    }
}