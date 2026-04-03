package com.Group2.Finlytic.repo;

import com.Group2.Finlytic.Model.BudgetHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BudgetHistoryRepo extends JpaRepository<BudgetHistory, Long> {

    // All budget snapshots for a specific month and year
    List<BudgetHistory> findByMonthAndYear(int month, int year);

    // Check if a snapshot already exists for this month/year
    // prevents duplicate snapshots if rollover is called twice
    boolean existsByMonthAndYear(int month, int year);

    // Single category snapshot for a month — for details modal
    List<BudgetHistory> findByMonthAndYearAndCategory(int month, int year, String category);
}