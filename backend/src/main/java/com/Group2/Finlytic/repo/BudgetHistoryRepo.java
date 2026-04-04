package com.Group2.Finlytic.repo;

import com.Group2.Finlytic.Model.BudgetHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface BudgetHistoryRepo extends JpaRepository<BudgetHistory, Long> {

    List<BudgetHistory> findByMonthAndYear(int month, int year);

    List<BudgetHistory> findByMonthAndYearAndUserId(int month, int year, Long userId);

    boolean existsByMonthAndYear(int month, int year);

    boolean existsByMonthAndYearAndUserId(int month, int year, Long userId);

    List<BudgetHistory> findByMonthAndYearAndCategory(int month, int year, String category);
}