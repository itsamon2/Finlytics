package com.Group2.Finlytic.repo;

import com.Group2.Finlytic.Model.Transactions;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
@Repository
public interface Transactionsrepo extends JpaRepository<Transactions, Long> {

    List<Transactions> findByUserId(Long userId);

    List<Transactions> findByCategoryAndUserId(String category, Long userId);

    @Query("SELECT t FROM Transactions t WHERE t.transactionId = :id AND t.userId = :userId")
    java.util.Optional<Transactions> findByTransactionIdAndUserId(
            @Param("id") Long id,
            @Param("userId") Long userId
    );

    // ── Current month ──────────────────────────────────
    @Query("""
        SELECT t FROM Transactions t
        WHERE t.type = 'INCOME'
          AND t.userId = :userId
          AND t.creationDate >= :start
          AND t.creationDate < :end
        """)
    List<Transactions> findCurrentMonthIncome(
            @Param("userId") Long userId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end
    );

    @Query("""
        SELECT t FROM Transactions t
        WHERE t.type = 'EXPENSE'
          AND t.userId = :userId
          AND t.creationDate >= :start
          AND t.creationDate < :end
        """)
    List<Transactions> findCurrentMonthExpenses(
            @Param("userId") Long userId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end
    );

    // ── All time ───────────────────────────────────────
    @Query("SELECT t FROM Transactions t WHERE t.type = 'INCOME' AND t.userId = :userId")
    List<Transactions> findAllIncome(@Param("userId") Long userId);

    @Query("SELECT t FROM Transactions t WHERE t.type = 'EXPENSE' AND t.userId = :userId")
    List<Transactions> findAllExpenses(@Param("userId") Long userId);

    // ── Last month ─────────────────────────────────────
    @Query("""
        SELECT t FROM Transactions t
        WHERE t.type = 'INCOME'
          AND t.userId = :userId
          AND t.creationDate >= :start
          AND t.creationDate < :end
        """)
    List<Transactions> findLastMonthIncome(
            @Param("userId") Long userId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end
    );

    @Query("""
        SELECT t FROM Transactions t
        WHERE t.type = 'EXPENSE'
          AND t.userId = :userId
          AND t.creationDate >= :start
          AND t.creationDate < :end
        """)
    List<Transactions> findLastMonthExpenses(
            @Param("userId") Long userId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end
    );

    // ── Last 12 months ─────────────────────────────────
    @Query("""
        SELECT t FROM Transactions t
        WHERE t.userId = :userId
          AND t.creationDate >= :startDate
        ORDER BY t.creationDate ASC
        """)
    List<Transactions> findLast12MonthsTransactions(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate
    );

    // ── By specific month/year ─────────────────────────
    @Query("""
        SELECT t FROM Transactions t
        WHERE t.userId = :userId
          AND t.creationDate >= :start
          AND t.creationDate < :end
        ORDER BY t.creationDate DESC
        """)
    List<Transactions> findByMonthAndYear(
            @Param("userId") Long userId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end
    );
}