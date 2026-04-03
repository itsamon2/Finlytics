package com.Group2.Finlytic.repo;

import com.Group2.Finlytic.Model.BudgetManager;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetManagerRepo extends JpaRepository<BudgetManager, Long> {
    List<BudgetManager> findByCategory(String category);
    Optional<BudgetManager> findFirstByCategoryIgnoreCase(String category);
}