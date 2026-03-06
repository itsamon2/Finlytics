package com.Group2.Finlytic.Service;

import com.Group2.Finlytic.Model.BudgetManager;
import com.Group2.Finlytic.repo.BudgetManagerRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class BudgetManagerService {

    @Autowired
    private BudgetManagerRepo budgetManagerRepo;

    // Create or update a budget
    public BudgetManager saveBudget(BudgetManager budget) {
        return budgetManagerRepo.save(budget);
    }

    // Get all budgets
    public List<BudgetManager> getAllBudgets() {
        return budgetManagerRepo.findAll();
    }

    // Get budget by ID
    public Optional<BudgetManager> getBudgetById(Long budgetId) {
        return budgetManagerRepo.findById(budgetId);
    }

    // Get budgets by category
    public List<BudgetManager> getBudgetsByCategory(String category) {
        return budgetManagerRepo.findByCategory(category);
    }

    // Update amount spent on a budget
    public Optional<BudgetManager> updateAmountSpent(Long budgetId, BigDecimal amount) {
        return budgetManagerRepo.findById(budgetId).map(budget -> {
            budget.setAmountSpent(budget.getAmountSpent().add(amount));
            return budgetManagerRepo.save(budget);
        });
    }

    // Check if budget is exceeded
    public boolean isBudgetExceeded(Long budgetId) {
        return budgetManagerRepo.findById(budgetId)
                .map(budget -> budget.getAmountSpent().compareTo(budget.getBudgetLimit()) > 0)
                .orElse(false);
    }

    // Delete a budget
    public void deleteBudget(Long budgetId) {
        budgetManagerRepo.deleteById(budgetId);
    }
}