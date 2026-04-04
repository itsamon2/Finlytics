package com.Group2.Finlytic.Controller;

import com.Group2.Finlytic.Model.Transactions;
import com.Group2.Finlytic.Service.TransactionsService;
import com.Group2.Finlytic.Service.CustomUserDetails;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
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

    // ── CREATE ──────────────────────────────────────────────
    @PostMapping
    public Transactions createTransaction(@RequestBody Transactions transaction,
                                          @AuthenticationPrincipal CustomUserDetails userDetails) {
        transaction.setUserId(userDetails.getUserId()); // tie to logged-in user
        return transactionsService.saveTransaction(transaction);
    }

    // ── GET ALL ──────────────────────────────────────────────
    @GetMapping
    public List<Transactions> getAllTransactions(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return transactionsService.getTransactionsByUserId(userDetails.getUserId());
    }

    // ── GET BY ID ───────────────────────────────────────────
    @GetMapping("/{id}")
    public Optional<Transactions> getTransaction(@PathVariable("id") Long id,
                                                 @AuthenticationPrincipal CustomUserDetails userDetails) {
        return transactionsService.getTransactionByIdAndUserId(id, userDetails.getUserId());
    }

    // ── GET BY CATEGORY ─────────────────────────────────────
    @GetMapping("/category/{category}")
    public List<Transactions> getTransactionsByCategory(@PathVariable("category") String category,
                                                        @AuthenticationPrincipal CustomUserDetails userDetails) {
        return transactionsService.getTransactionsByCategoryAndUserId(category, userDetails.getUserId());
    }

    // ── DASHBOARD SUMMARY ───────────────────────────────────
    @GetMapping("/summary")
    public Map<String, Object> getDashboardSummary(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return transactionsService.getDashboardSummary(userDetails.getUserId());
    }

    // ── MONTHLY CASHFLOW ───────────────────────────────────
    @GetMapping("/cashflow")
    public List<Map<String, Object>> getMonthlyCashflow(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return transactionsService.getMonthlyCashflow(userDetails.getUserId());
    }

    // ── MONTHLY EXPENSES BY CATEGORY ───────────────────────
    @GetMapping("/expenses/category")
    public Map<String, BigDecimal> getMonthlyExpensesByCategory(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return transactionsService.getMonthlyExpensesByCategory(userDetails.getUserId());
    }

    // ── FILTER BY MONTH/YEAR ───────────────────────────────
    @GetMapping("/by-month")
    public List<Transactions> getTransactionsByMonth(
            @RequestParam int month,
            @RequestParam int year,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return transactionsService.getTransactionsByMonth(userDetails.getUserId(), month, year);
    }

    // ── DELETE ─────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public void deleteTransaction(@PathVariable("id") Long id,
                                  @AuthenticationPrincipal CustomUserDetails userDetails) {
        transactionsService.deleteTransactionByIdAndUserId(id, userDetails.getUserId());
    }
}