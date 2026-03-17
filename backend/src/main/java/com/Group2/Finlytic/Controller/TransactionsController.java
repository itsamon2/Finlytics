package com.Group2.Finlytic.Controller;

import com.Group2.Finlytic.Model.Transactions;
import com.Group2.Finlytic.Service.TransactionsService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/transactions")
public class TransactionsController {

    private final TransactionsService transactionsService;

    public TransactionsController(TransactionsService transactionsService) {
        this.transactionsService = transactionsService;
    }

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

    // Fetch transactions by category — powers the budget details modal recent transactions
    @GetMapping("/category/{category}")
    public List<Transactions> getTransactionsByCategory(@PathVariable("category") String category) {
        return transactionsService.getTransactionsByCategory(category);
    }

    @DeleteMapping("/{id}")
    public void deleteTransaction(@PathVariable("id") Long id) {
        transactionsService.deleteTransaction(id);
    }
}