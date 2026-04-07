package com.Group2.Finlytic.Controller;

import com.Group2.Finlytic.Model.User;
import com.Group2.Finlytic.Service.HealthService;
import com.Group2.Finlytic.Service.TaxService;
import com.Group2.Finlytic.repo.UserRepo;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("api/health")
public class HealthController {

    private final HealthService healthService;
    private final TaxService taxService;
    private final UserRepo userRepo;

    public HealthController(HealthService healthService, TaxService taxService, UserRepo userRepo) {
        this.healthService = healthService;
        this.taxService = taxService;
        this.userRepo = userRepo;
    }

    @GetMapping
    public Map<String, Object> getHealthMetrics(@AuthenticationPrincipal UserDetails userDetails) {

        String email = userDetails.getUsername();
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Long userId = user.getId();

        int savingsRate                  = healthService.calculateSavingsRate(userId);
        int dti                          = healthService.calculateDTI(userId);
        int emergencyFund                = healthService.calculateEmergencyFundCoverage(userId);
        BigDecimal investmentGrowth      = healthService.calculateInvestmentGrowth(userId);
        Map<String, Object> healthScore  = healthService.calculateFinancialHealthScore(userId);

        return Map.of(
                "savingsRate",      savingsRate,
                "debtToIncome",     dti,
                "emergencyFund",    emergencyFund,
                "investmentGrowth", investmentGrowth,
                "healthScore",      healthScore
        );
    }

    @GetMapping("/tax")
    public Map<String, BigDecimal> getTaxSummary(@AuthenticationPrincipal UserDetails userDetails) {

        String email = userDetails.getUsername();
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return taxService.calculateTax(user.getId());
    }
}