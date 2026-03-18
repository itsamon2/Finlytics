package com.Group2.Finlytic.repo;

import com.Group2.Finlytic.Model.Goals;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GoalsRepo extends JpaRepository<Goals, Long> {

    List<Goals> findByGoalNameContainingIgnoreCase(String goalName);

    List<Goals> findByGoalId(Long goalId);
}
