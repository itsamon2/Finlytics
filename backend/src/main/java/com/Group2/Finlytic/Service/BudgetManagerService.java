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

    public BudgetManager saveBudget(BudgetManager budget, Long userId) {
        budget.setUserId(userId);
        LocalDate start = LocalDate.now().withDayOfMonth(1);
        LocalDate end   = start.plusMonths(1);

        BigDecimal alreadySpent = transactionsrepo
                .findByMonthAndYear(userId, start, end)  // ✅ correct order + LocalDate
                .stream()
                .filter(t -> t.getType() == Transactions.TransactionType.EXPENSE)
                .filter(t -> t.getCategory() != null &&
                        t.getCategory().equalsIgnoreCase(budget.getCategory()))
                .map(Transactions::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        budget.setAmountSpent(alreadySpent);
        return budgetManagerRepo.save(budget);
    }

    public List<BudgetManager> getAllBudgets(Long userId) {
        return budgetManagerRepo.findByUserId(userId);  // ✅
    }

    public Optional<BudgetManager> getBudgetById(Long budgetId, Long userId) {
        return budgetManagerRepo.findByBudgetIdAndUserId(budgetId, userId);  // ✅
    }

    public List<BudgetManager> getBudgetsByCategory(String category, Long userId) {
        return budgetManagerRepo.findByCategoryAndUserId(category, userId);  // ✅
    }

    public Optional<BudgetManager> updateAmountSpent(Long budgetId, BigDecimal amount, Long userId) {
        return budgetManagerRepo.findByBudgetIdAndUserId(budgetId, userId).map(budget -> {
            budget.setAmountSpent(budget.getAmountSpent().add(amount));
            return budgetManagerRepo.save(budget);
        });
    }

    public Optional<BudgetManager> updateBudget(Long budgetId, BudgetManager updatedBudget, Long userId) {
        return budgetManagerRepo.findByBudgetIdAndUserId(budgetId, userId).map(existing -> {
            existing.setCategory(updatedBudget.getCategory());
            existing.setBudgetLimit(updatedBudget.getBudgetLimit());
            existing.setColor(updatedBudget.getColor());
            existing.setBudgetPeriod(updatedBudget.getBudgetPeriod());
            return budgetManagerRepo.save(existing);
        });
    }

    public void updateBudgetFromTransaction(Transactions transaction) {
        if (transaction.getType() == Transactions.TransactionType.EXPENSE) {
            budgetManagerRepo
                    .findFirstByCategoryIgnoreCaseAndUserId(
                            transaction.getCategory(), transaction.getUserId())  // ✅
                    .ifPresent(budget -> {
                        budget.setAmountSpent(budget.getAmountSpent().add(transaction.getAmount()));
                        budgetManagerRepo.save(budget);
                    });
        }
    }

    public boolean isBudgetExceeded(Long budgetId, Long userId) {
        return budgetManagerRepo.findByBudgetIdAndUserId(budgetId, userId)
                .map(budget -> budget.getAmountSpent().compareTo(budget.getBudgetLimit()) > 0)
                .orElse(false);
    }

    public void deleteBudget(Long budgetId, Long userId) {
        budgetManagerRepo.findByBudgetIdAndUserId(budgetId, userId)
                .ifPresent(budget -> budgetManagerRepo.deleteById(budgetId));  // ✅ verify ownership before delete
    }

    public boolean isRolloverNeeded(Long userId) {
        int currentMonth = LocalDate.now().getMonthValue();
        int currentYear  = LocalDate.now().getYear();

        if (budgetHistoryRepo.existsByMonthAndYearAndUserId(currentMonth, currentYear, userId)) {  // ✅
            return false;
        }

        List<BudgetManager> budgets = budgetManagerRepo.findByUserId(userId);  // ✅
        if (budgets.isEmpty()) return false;

        return budgets.stream().anyMatch(b ->
                b.getCreationDate() != null &&
                        (b.getCreationDate().getMonthValue() < currentMonth ||
                                b.getCreationDate().getYear() < currentYear)
        );
    }

    public void rolloverBudgets(boolean continueWithSame, Long userId) {
        int previousMonth = LocalDate.now().minusMonths(1).getMonthValue();
        int previousYear  = LocalDate.now().minusMonths(1).getYear();
        int currentMonth  = LocalDate.now().getMonthValue();
        int currentYear   = LocalDate.now().getYear();

        List<BudgetManager> budgets = budgetManagerRepo.findByUserId(userId);  // ✅

        if (!budgetHistoryRepo.existsByMonthAndYearAndUserId(previousMonth, previousYear, userId)) {  // ✅
            budgets.forEach(budget -> {
                BudgetHistory snapshot = new BudgetHistory();
                snapshot.setUserId(userId);  // ✅
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

        if (!budgetHistoryRepo.existsByMonthAndYearAndUserId(currentMonth, currentYear, userId)) {  // ✅
            BudgetHistory placeholder = new BudgetHistory();
            placeholder.setUserId(userId);  // ✅
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

    public Map<String, Object> getBudgetsByMonth(int month, int year, Long userId) {
        int currentMonth = LocalDate.now().getMonthValue();
        int currentYear  = LocalDate.now().getYear();

        boolean isCurrentMonth = (month == currentMonth && year == currentYear);

        if (isCurrentMonth) {
            return Map.of(
                    "isCurrentMonth", true,
                    "budgets", budgetManagerRepo.findByUserId(userId)  // ✅
            );
        } else {
            List<BudgetHistory> history = budgetHistoryRepo
                    .findByMonthAndYearAndUserId(month, year, userId)  // ✅
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