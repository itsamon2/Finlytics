package com.Group2.Finlytic.Controller;

import com.Group2.Finlytic.Model.BudgetManager;
import com.Group2.Finlytic.Service.BudgetManagerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/budgets")
public class BudgetManagerController {

    private final BudgetManagerService budgetManagerService;

    public BudgetManagerController(BudgetManagerService budgetManagerService) {
        this.budgetManagerService = budgetManagerService;
    }

    // ── Existing endpoints (unchanged) ───────────────────────────────────────

    @PostMapping
    public BudgetManager createBudget(@RequestBody BudgetManager budget) {
        return budgetManagerService.saveBudget(budget);
    }

    @GetMapping
    public List<BudgetManager> getAllBudgets() {
        return budgetManagerService.getAllBudgets();
    }

    @GetMapping("/{id}")
    public Optional<BudgetManager> getBudget(@PathVariable("id") Long id) {
        return budgetManagerService.getBudgetById(id);
    }

    @GetMapping("/category/{category}")
    public List<BudgetManager> getBudgetsByCategory(@PathVariable("category") String category) {
        return budgetManagerService.getBudgetsByCategory(category);
    }

    @PatchMapping("/{id}/spend")
    public Optional<BudgetManager> updateSpending(@PathVariable("id") Long id,
                                                  @RequestParam("amount") BigDecimal amount) {
        return budgetManagerService.updateAmountSpent(id, amount);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BudgetManager> updateBudget(@PathVariable("id") Long id,
                                                      @RequestBody BudgetManager updatedBudget) {
        return budgetManagerService.updateBudget(id, updatedBudget)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/exceeded")
    public boolean isBudgetExceeded(@PathVariable("id") Long id) {
        return budgetManagerService.isBudgetExceeded(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteBudget(@PathVariable Long id) {
        budgetManagerService.deleteBudget(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    // ── New endpoints ─────────────────────────────────────────────────────────

    // Check if a rollover prompt is needed — called on BudgetsPage load
    @GetMapping("/check-rollover")
    public ResponseEntity<Map<String, Boolean>> checkRollover() {
        boolean needed = budgetManagerService.isRolloverNeeded();
        return ResponseEntity.ok(Map.of("rolloverNeeded", needed));
    }

    // Execute rollover — called when user responds to the modal
    // continue=true  → keep budgets, reset amountSpent
    // continue=false → just snapshot, user creates new ones
    @PostMapping("/rollover")
    public ResponseEntity<Map<String, Object>> rollover(@RequestParam("continue") boolean continueWithSame) {
        budgetManagerService.rolloverBudgets(continueWithSame);
        return ResponseEntity.ok(Map.of("success", true));
    }

    // Get budgets for a specific month — live for current, history for past
    @GetMapping("/by-month")
    public ResponseEntity<Map<String, Object>> getBudgetsByMonth(
            @RequestParam int month,
            @RequestParam int year) {
        return ResponseEntity.ok(budgetManagerService.getBudgetsByMonth(month, year));
    }

    // Transactions filtered by month/year — for past month transaction view
    // Delegates to TransactionsService via a separate endpoint
    @GetMapping("/current-month")
    public ResponseEntity<Map<String, Object>> getCurrentMonthInfo() {
        int month = LocalDate.now().getMonthValue();
        int year  = LocalDate.now().getYear();
        return ResponseEntity.ok(Map.of(
                "month", month,
                "year",  year
        ));
    }
}