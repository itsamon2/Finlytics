package com.Group2.Finlytic.Service;

import com.Group2.Finlytic.Model.IncomeProfile;
import com.Group2.Finlytic.repo.IncomeProfileRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Date;

@Service
public class IncomeProfileService {

    @Autowired
    private IncomeProfileRepo incomeProfileRepo;

    public IncomeProfile addIncome(IncomeProfile incomeProfile) {
        IncomeProfile profile = new IncomeProfile();
        profile.setDeclaredMonthlyIncome(new BigDecimal("10000")); // must not be null
        profile.setCreatedDate(new Date());
        profile.setUpdatedDate(new Date());

        incomeProfileRepo.save(profile);
        return incomeProfileRepo.save(incomeProfile);
    }

    public IncomeProfile updateIncome(IncomeProfile incomeProfile) {

        return incomeProfileRepo.save(incomeProfile);
    }

}
