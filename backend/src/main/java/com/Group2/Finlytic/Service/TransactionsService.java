package com.Group2.Finlytic.Service;

import com.Group2.Finlytic.Model.TransactionAnalysis;
import com.Group2.Finlytic.Model.Transactions;
import com.Group2.Finlytic.repo.Transactionsrepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TransactionsService {

    @Autowired
    private Transactionsrepo transactionsrepo;

    @Autowired
    private CategorizationService categorizationService;

    @Autowired
    private BudgetManagerService budgetManagerService; // ← ADD THIS

    // Save transaction + auto-categorize
    public Transactions saveTransaction(Transactions transaction) {
        if (transaction.getRawMessage() != null && !transaction.getRawMessage().isEmpty()) {
            TransactionAnalysis analysis = categorizationService.analyze(transaction.getRawMessage());
            transaction.setCategory(analysis.category());
            transaction.setType(Transactions.TransactionType.valueOf(analysis.transactionType()));
            transaction.setAmount(analysis.amount());
        }
        Transactions saved = transactionsrepo.save(transaction);
        budgetManagerService.updateBudgetFromTransaction(saved); // ← lowercase b
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

    // Delete transaction
    public void deleteTransaction(Long transactionId) {
        transactionsrepo.deleteById(transactionId);
    }
    public Map<String, BigDecimal> getMonthlyExpensesByCategory() {
        List<Transactions> expenses = transactionsrepo.findCurrentMonthExpenses();

        return expenses.stream()
                .filter(t -> t.getCategory() != null)
                .collect(
                        Collectors.groupingBy(
                                Transactions::getCategory,
                                Collectors.reducing(BigDecimal.ZERO, Transactions::getAmount, BigDecimal::add)
                        )
                );
    }

    // Get total monthly income
    public BigDecimal getMonthlyIncome() {
        List<Transactions> incomeList = transactionsrepo.findCurrentMonthIncome();

        return incomeList.stream()
                .map(Transactions::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

}