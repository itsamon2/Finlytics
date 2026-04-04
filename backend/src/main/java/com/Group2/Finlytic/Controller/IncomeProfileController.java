package com.Group2.Finlytic.Controller;

import com.Group2.Finlytic.Model.IncomeProfile;
import com.Group2.Finlytic.Service.CustomUserDetails;
import com.Group2.Finlytic.Service.IncomeProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/income")
public class IncomeProfileController {

    @Autowired
    private IncomeProfileService incomeProfileService;

    @PostMapping
    public IncomeProfile addIncome(@RequestBody IncomeProfile incomeProfile,
                                   @AuthenticationPrincipal CustomUserDetails userDetails) {
        return incomeProfileService.addIncome(incomeProfile, userDetails.getUserId());
    }

    @PutMapping
    public IncomeProfile updateIncome(@RequestBody IncomeProfile incomeProfile,
                                      @AuthenticationPrincipal CustomUserDetails userDetails) {
        return incomeProfileService.updateIncome(incomeProfile, userDetails.getUserId());
    }

    @GetMapping
    public ResponseEntity<IncomeProfile> getIncomeProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return incomeProfileService.getIncomeProfile(userDetails.getUserId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}