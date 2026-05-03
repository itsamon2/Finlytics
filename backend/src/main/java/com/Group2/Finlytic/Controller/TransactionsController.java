package com.Group2.Finlytic.Controller;

import com.Group2.Finlytic.Model.Transactions;
import com.Group2.Finlytic.Service.TransactionsService;
import com.Group2.Finlytic.Service.CustomUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
public class TransactionsController {

    private final TransactionsService transactionsService;

    public TransactionsController(TransactionsService transactionsService) {
        this.transactionsService = transactionsService;
    }

    // ── CREATE (manual) ─────────────────────────────────────
    @PostMapping
    public Transactions createTransaction(
            @RequestBody Transactions transaction,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        transaction.setUserId(userDetails.getUserId());
        return transactionsService.saveTransaction(transaction);
    }

    // ── ANALYZE RAW MESSAGE + AUTO-SAVE ─────────────────────
    // Step 1: paste M-Pesa SMS → AI categorizes, saves, attempts goal match
    @PostMapping("/analyze")
    public Map<String, Object> analyzeTransaction(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        String rawMessage = body.get("rawMessage");
        return transactionsService.analyzeAndSave(rawMessage, userDetails.getUserId());
    }

    // ── ASSIGN GOAL AFTER CLARIFICATION ─────────────────────
    // Step 2: user answers "what are you saving for?" → updates transaction + goal
    @PostMapping("/{id}/assign-goal")
    public Map<String, Object> assignGoal(
            @PathVariable("id") Long transactionId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        String goalHint = body.get("goalHint");
        return transactionsService.assignGoalToTransaction(
                transactionId, userDetails.getUserId(), goalHint);
    }

    // ── GET ALL ──────────────────────────────────────────────
    @GetMapping
    public List<Transactions> getAllTransactions(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return transactionsService.getTransactionsByUserId(userDetails.getUserId());
    }

    // ── GET BY ID ───────────────────────────────────────────
    // FIX 1: Was returning Optional<Transactions> directly — Spring serialized
    //         an empty Optional as 200 OK with no body instead of 404.
    //         Now properly returns 404 when the transaction is not found.
    @GetMapping("/{id}")
    public ResponseEntity<Transactions> getTransaction(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return transactionsService
                .getTransactionByIdAndUserId(id, userDetails.getUserId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ── GET BY CATEGORY ─────────────────────────────────────
    @GetMapping("/category/{category}")
    public List<Transactions> getTransactionsByCategory(
            @PathVariable("category") String category,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return transactionsService.getTransactionsByCategoryAndUserId(
                category, userDetails.getUserId());
    }

    // ── DASHBOARD SUMMARY ───────────────────────────────────
    @GetMapping("/summary")
    public Map<String, Object> getDashboardSummary(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return transactionsService.getDashboardSummary(userDetails.getUserId());
    }

    // ── MONTHLY CASHFLOW ───────────────────────────────────
    @GetMapping("/cashflow")
    public List<Map<String, Object>> getMonthlyCashflow(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return transactionsService.getMonthlyCashflow(userDetails.getUserId());
    }

    // ── MONTHLY EXPENSES BY CATEGORY ───────────────────────
    @GetMapping("/expenses/category")
    public Map<String, BigDecimal> getMonthlyExpensesByCategory(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return transactionsService.getMonthlyExpensesByCategory(userDetails.getUserId());
    }

    // ── FILTER BY MONTH/YEAR ───────────────────────────────
    @GetMapping("/by-month")
    public List<Transactions> getTransactionsByMonth(
            @RequestParam int month,
            @RequestParam int year,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return transactionsService.getTransactionsByMonth(
                userDetails.getUserId(), month, year);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteTransaction(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            transactionsService.deleteTransactionByIdAndUserId(id, userDetails.getUserId());
            return ResponseEntity.ok(
                    Map.of("success", true, "message", "Transaction deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(
                    Map.of("success", false, "message", e.getMessage()));
        }
    }

}