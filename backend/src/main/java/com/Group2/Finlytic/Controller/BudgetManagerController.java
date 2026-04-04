package com.Group2.Finlytic.Controller;

import com.Group2.Finlytic.Model.BudgetManager;
import com.Group2.Finlytic.Service.BudgetManagerService;
import com.Group2.Finlytic.Service.CustomUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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

    @PostMapping
    public BudgetManager createBudget(@RequestBody BudgetManager budget,
                                      @AuthenticationPrincipal CustomUserDetails userDetails) {
        return budgetManagerService.saveBudget(budget, userDetails.getUserId());
    }

    @GetMapping
    public List<BudgetManager> getAllBudgets(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return budgetManagerService.getAllBudgets(userDetails.getUserId());
    }

    @GetMapping("/{id}")
    public Optional<BudgetManager> getBudget(@PathVariable("id") Long id,
                                             @AuthenticationPrincipal CustomUserDetails userDetails) {
        return budgetManagerService.getBudgetById(id, userDetails.getUserId());
    }

    @GetMapping("/category/{category}")
    public List<BudgetManager> getBudgetsByCategory(@PathVariable("category") String category,
                                                    @AuthenticationPrincipal CustomUserDetails userDetails) {
        return budgetManagerService.getBudgetsByCategory(category, userDetails.getUserId());
    }

    @PatchMapping("/{id}/spend")
    public Optional<BudgetManager> updateSpending(@PathVariable("id") Long id,
                                                  @RequestParam("amount") BigDecimal amount,
                                                  @AuthenticationPrincipal CustomUserDetails userDetails) {
        return budgetManagerService.updateAmountSpent(id, amount, userDetails.getUserId());
    }

    @PutMapping("/{id}")
    public ResponseEntity<BudgetManager> updateBudget(@PathVariable("id") Long id,
                                                      @RequestBody BudgetManager updatedBudget,
                                                      @AuthenticationPrincipal CustomUserDetails userDetails) {
        return budgetManagerService.updateBudget(id, updatedBudget, userDetails.getUserId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/exceeded")
    public boolean isBudgetExceeded(@PathVariable("id") Long id,
                                    @AuthenticationPrincipal CustomUserDetails userDetails) {
        return budgetManagerService.isBudgetExceeded(id, userDetails.getUserId());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteBudget(@PathVariable Long id,
                                                            @AuthenticationPrincipal CustomUserDetails userDetails) {
        budgetManagerService.deleteBudget(id, userDetails.getUserId());
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/check-rollover")
    public ResponseEntity<Map<String, Boolean>> checkRollover(@AuthenticationPrincipal CustomUserDetails userDetails) {
        boolean needed = budgetManagerService.isRolloverNeeded(userDetails.getUserId());
        return ResponseEntity.ok(Map.of("rolloverNeeded", needed));
    }

    @PostMapping("/rollover")
    public ResponseEntity<Map<String, Object>> rollover(@RequestParam("continue") boolean continueWithSame,
                                                        @AuthenticationPrincipal CustomUserDetails userDetails) {
        budgetManagerService.rolloverBudgets(continueWithSame, userDetails.getUserId());
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/by-month")
    public ResponseEntity<Map<String, Object>> getBudgetsByMonth(
            @RequestParam int month,
            @RequestParam int year,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(budgetManagerService.getBudgetsByMonth(month, year, userDetails.getUserId()));
    }

    @GetMapping("/current-month")
    public ResponseEntity<Map<String, Object>> getCurrentMonthInfo() {
        int month = LocalDate.now().getMonthValue();
        int year  = LocalDate.now().getYear();
        return ResponseEntity.ok(Map.of("month", month, "year", year));
    }
}