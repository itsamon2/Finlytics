package com.Group2.Finlytic.repo;

import com.Group2.Finlytic.Model.Goals;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GoalsRepo extends JpaRepository<Goals, Long> {

    List<Goals> findByUserId(Long userId);

    Optional<Goals> findByGoalIdAndUserId(Long goalId, Long userId);

    List<Goals> findByGoalNameContainingIgnoreCaseAndUserId(String goalName, Long userId);
}