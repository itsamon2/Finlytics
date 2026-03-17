package com.Group2.Finlytic.repo;

import com.Group2.Finlytic.Model.Transactions;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface Transactionsrepo extends JpaRepository<Transactions, Long> {

    // Get all expenses for current month
    @Query("""
            SELECT t FROM Transactions t
            WHERE t.type = 'EXPENSE'
            AND MONTH(t.creationDate) = MONTH(CURRENT_DATE)
            AND YEAR(t.creationDate) = YEAR(CURRENT_DATE)
            """)
    List<Transactions> findCurrentMonthExpenses();

    // Get all income for current month
    @Query("""
            SELECT t FROM Transactions t
            WHERE t.type = 'INCOME'
            AND MONTH(t.creationDate) = MONTH(CURRENT_DATE)
            AND YEAR(t.creationDate) = YEAR(CURRENT_DATE)
            """)
    List<Transactions> findCurrentMonthIncome();

    // Find transactions by category
    List<Transactions> findByCategory(String category);
}