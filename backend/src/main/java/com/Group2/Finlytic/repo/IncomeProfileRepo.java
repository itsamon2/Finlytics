package com.Group2.Finlytic.repo;

import com.Group2.Finlytic.Model.IncomeProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IncomeProfileRepo extends JpaRepository<IncomeProfile, Long> {

    Optional<IncomeProfile> findByUserId(Long userId);
}
