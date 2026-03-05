package com.Group2.Finylitics.Service;

import com.Group2.Finylitics.Model.Transactions;
import com.Group2.Finylitics.repo.Transactionsrepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TransactionsService {

    @Autowired
    private  Transactionsrepo transactionsrepo;


    // Save transaction
    public Transactions saveTransaction(Transactions transaction) {
        return transactionsrepo.save(transaction);
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
}