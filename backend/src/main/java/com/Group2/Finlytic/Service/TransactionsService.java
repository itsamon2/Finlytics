package com.Group2.Finlytic.Service;

import com.Group2.Finlytic.Model.TransactionAnalysis;
import com.Group2.Finlytic.Model.Transactions;
import com.Group2.Finlytic.repo.Transactionsrepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TransactionsService {

    @Autowired
    private Transactionsrepo transactionsrepo;

    @Autowired
    private CategorizationService categorizationService;

    @Autowired
    private BudgetManagerService budgetManagerService;

    // Save transaction + auto-categorize
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

    // Get all transactions
    public List<Transactions> getAllTransactions() {
        return transactionsrepo.findAll();
    }

    // Get transaction by ID
    public Optional<Transactions> getTransactionById(Long transactionId) {
        return transactionsrepo.findById(transactionId);
    }

    // Get transactions by category — used by budget details modal
    public List<Transactions> getTransactionsByCategory(String category) {
        return transactionsrepo.findByCategory(category);
    }

    // Delete transaction
    public void deleteTransaction(Long transactionId) {
        transactionsrepo.deleteById(transactionId);
    }
}