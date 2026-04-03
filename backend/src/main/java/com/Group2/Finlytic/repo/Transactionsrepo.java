package com.Group2.Finlytic.repo;

import com.Group2.Finlytic.Model.Transactions;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface Transactionsrepo extends JpaRepository<Transactions, Long> {

    // ── Existing queries (unchanged) ─────────────────────────────────────────

    @Query("""
            SELECT t FROM Transactions t
            WHERE t.type = 'EXPENSE'
            AND MONTH(t.creationDate) = MONTH(CURRENT_DATE)
            AND YEAR(t.creationDate) = YEAR(CURRENT_DATE)
            """)
    List<Transactions> findCurrentMonthExpenses();

    @Query("""
            SELECT t FROM Transactions t
            WHERE t.type = 'INCOME'
            AND MONTH(t.creationDate) = MONTH(CURRENT_DATE)
            AND YEAR(t.creationDate) = YEAR(CURRENT_DATE)
            """)
    List<Transactions> findCurrentMonthIncome();

    List<Transactions> findByCategory(String category);

    // ── New queries ───────────────────────────────────────────────────────────

    // All income ever — for total balance calculation
    @Query("""
            SELECT t FROM Transactions t
            WHERE t.type = 'INCOME'
            """)
    List<Transactions> findAllIncome();

    // All expenses ever — for total balance calculation
    @Query("""
            SELECT t FROM Transactions t
            WHERE t.type = 'EXPENSE'
            """)
    List<Transactions> findAllExpenses();

    // Last month income — for trend comparison
    @Query("""
            SELECT t FROM Transactions t
            WHERE t.type = 'INCOME'
            AND MONTH(t.creationDate) = MONTH(CURRENT_DATE) - 1
            AND YEAR(t.creationDate) = YEAR(CURRENT_DATE)
            """)
    List<Transactions> findLastMonthIncome();

    // Last month expenses — for trend comparison
    @Query("""
            SELECT t FROM Transactions t
            WHERE t.type = 'EXPENSE'
            AND MONTH(t.creationDate) = MONTH(CURRENT_DATE) - 1
            AND YEAR(t.creationDate) = YEAR(CURRENT_DATE)
            """)
    List<Transactions> findLastMonthExpenses();

    // All transactions for cashflow chart — last 12 months
    @Query("""
        SELECT t FROM Transactions t
        WHERE t.creationDate >= :startDate
        ORDER BY t.creationDate ASC
        """)
    List<Transactions> findLast12MonthsTransactions(
            @Param("startDate") java.time.LocalDate startDate);
    // Transactions for a specific month and year
    @Query("""
        SELECT t FROM Transactions t
        WHERE MONTH(t.creationDate) = :month
        AND YEAR(t.creationDate) = :year
        ORDER BY t.creationDate DESC
        """)
    List<Transactions> findByMonthAndYear(
            @Param("month") int month,
            @Param("year") int year);
}