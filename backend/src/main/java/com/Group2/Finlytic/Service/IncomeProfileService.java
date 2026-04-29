package com.Group2.Finlytic.Service;

import com.Group2.Finlytic.Model.IncomeProfile;
import com.Group2.Finlytic.repo.IncomeProfileRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Optional;

@Service
public class IncomeProfileService {

    @Autowired
    private IncomeProfileRepo incomeProfileRepo;

    public IncomeProfile addIncome(IncomeProfile incomeProfile, Long userId) {
        incomeProfile.setUserId(userId);
        incomeProfile.setCreatedDate(LocalDate.now());
        incomeProfile.setUpdatedDate(LocalDate.now());
        return incomeProfileRepo.save(incomeProfile);
    }

    public IncomeProfile updateIncome(IncomeProfile incomeProfile, Long userId) {
        incomeProfile.setUserId(userId);
        incomeProfile.setUpdatedDate(LocalDate.now());
        return incomeProfileRepo.save(incomeProfile);
    }

    public Optional<IncomeProfile> getIncomeProfile(Long userId) {

        return incomeProfileRepo.findByUserId(userId);
    }
}