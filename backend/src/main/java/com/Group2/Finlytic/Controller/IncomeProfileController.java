package com.Group2.Finlytic.Controller;

import com.Group2.Finlytic.Model.IncomeProfile;
import com.Group2.Finlytic.Service.IncomeProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/Income")
public class IncomeProfileController {
    @Autowired
    private IncomeProfileService incomeProfileService;

    @PostMapping
    public IncomeProfile addIncome(@RequestBody IncomeProfile incomeProfile) {
        return incomeProfileService.addIncome(incomeProfile);
    }
    @PutMapping
     public IncomeProfile updateIncome(@RequestBody IncomeProfile incomeProfile) {
        return incomeProfileService.updateIncome(incomeProfile);
     }
}
