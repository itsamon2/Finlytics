package com.Group2.Finlytic.repo;

import com.Group2.Finlytic.Model.Scenario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ScenarioRepo extends JpaRepository<Scenario, Long> {

    // All saved scenarios for a user newest first
    List<Scenario> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Verify ownership before delete
    Optional<Scenario> findByScenarioIdAndUserId(Long scenarioId, Long userId);
}