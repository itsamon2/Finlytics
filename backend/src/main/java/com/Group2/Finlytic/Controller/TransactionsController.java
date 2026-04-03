package com.Group2.Finlytic.Controller;

import com.Group2.Finlytic.Model.Transactions;
import com.Group2.Finlytic.Service.TransactionsService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/transactions")
public class TransactionsController {

    private final TransactionsService transactionsService;

    public TransactionsController(TransactionsService transactionsService) {
        this.transactionsService = transactionsService;
    }

    // ── Existing endpoints (unchanged) ───────────────────────────────────────

    @PostMapping
    public Transactions createTransaction(@RequestBody Transactions transaction) {
        return transactionsService.saveTransaction(transaction);
    }

    @GetMapping
    public List<Transactions> getAllTransactions() {
        return transactionsService.getAllTransactions();
    }

    @GetMapping("/{id}")
    public Optional<Transactions> getTransaction(@PathVariable("id") Long id) {
        return transactionsService.getTransactionById(id);
    }

    @GetMapping("/category/{category}")
    public List<Transactions> getTransactionsByCategory(@PathVariable("category") String category) {
        return transactionsService.getTransactionsByCategory(category);
    }

    @DeleteMapping("/{id}")
    public void deleteTransaction(@PathVariable("id") Long id) {
        transactionsService.deleteTransaction(id);
    }

    // ── New endpoints ─────────────────────────────────────────────────────────

    // All summary cards + trends in one call
    @GetMapping("/summary")
    public Map<String, Object> getDashboardSummary() {
        return transactionsService.getDashboardSummary();
    }

    // Monthly cashflow for the chart
    @GetMapping("/cashflow")
    public List<Map<String, Object>> getMonthlyCashflow() {
        return transactionsService.getMonthlyCashflow();
    }

    // Current month expenses by category — for ExpenseBreakdown
    @GetMapping("/expenses/category")
    public Map<String, java.math.BigDecimal> getMonthlyExpensesByCategory() {
        return transactionsService.getMonthlyExpensesByCategory();
    }
    // Get transactions filtered by month and year — for history browsing
    @GetMapping("/by-month")
    public List<Transactions> getTransactionsByMonth(
            @RequestParam int month,
            @RequestParam int year) {
        return transactionsService.getTransactionsByMonth(month, year);
    }
}