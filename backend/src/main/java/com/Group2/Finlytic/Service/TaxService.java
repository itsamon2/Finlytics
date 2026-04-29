package com.Group2.Finlytic.Service;

import com.Group2.Finlytic.Model.IncomeProfile;
import com.Group2.Finlytic.repo.IncomeProfileRepo;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;
import java.util.Optional;

@Service
public class TaxService {

    private final IncomeProfileRepo incomeProfileRepo;

    public TaxService(IncomeProfileRepo incomeProfileRepo) {
        this.incomeProfileRepo = incomeProfileRepo;
    }

    public Map<String, BigDecimal> calculateTax(Long userId) {

        Optional<IncomeProfile> profileOpt = incomeProfileRepo.findByUserId(userId);
        if (profileOpt.isEmpty()) {
            return Map.of(
                    "grossIncome",      BigDecimal.ZERO,
                    "totalDeductions",  BigDecimal.ZERO,
                    "estimatedTax",     BigDecimal.ZERO,
                    "afterTax",         BigDecimal.ZERO
            );
        }

        IncomeProfile profile = profileOpt.get();
        BigDecimal monthlyIncome = profile.getDeclaredMonthlyIncome();
        BigDecimal annualIncome = monthlyIncome.multiply(BigDecimal.valueOf(12));

        BigDecimal tax = BigDecimal.ZERO;
        BigDecimal remaining = annualIncome;

        // Band 1: 0 - 288,000 @ 10%
        BigDecimal band1Limit = BigDecimal.valueOf(288_000);
        if (remaining.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal taxable = remaining.min(band1Limit);
            tax = tax.add(taxable.multiply(BigDecimal.valueOf(0.10)));
            remaining = remaining.subtract(taxable);
        }

        // Band 2: 288,001 - 388,000 @ 25%
        BigDecimal band2Limit = BigDecimal.valueOf(100_000);
        if (remaining.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal taxable = remaining.min(band2Limit);
            tax = tax.add(taxable.multiply(BigDecimal.valueOf(0.25)));
            remaining = remaining.subtract(taxable);
        }

        // Band 3: 388,001 - 6,000,000 @ 30%
        BigDecimal band3Limit = BigDecimal.valueOf(5_612_000);
        if (remaining.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal taxable = remaining.min(band3Limit);
            tax = tax.add(taxable.multiply(BigDecimal.valueOf(0.30)));
            remaining = remaining.subtract(taxable);
        }

        // Band 4: 6,000,001 - 9,600,000 @ 32.5%
        BigDecimal band4Limit = BigDecimal.valueOf(3_600_000);
        if (remaining.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal taxable = remaining.min(band4Limit);
            tax = tax.add(taxable.multiply(BigDecimal.valueOf(0.325)));
            remaining = remaining.subtract(taxable);
        }

        // Band 5: 9,600,001+ @ 35%
        if (remaining.compareTo(BigDecimal.ZERO) > 0) {
            tax = tax.add(remaining.multiply(BigDecimal.valueOf(0.35)));
        }

        // Personal Relief: KSh 28,800/year
        BigDecimal personalRelief = BigDecimal.valueOf(28_800);
        tax = tax.subtract(personalRelief).max(BigDecimal.ZERO);

        // Deductions: NSSF (KSh 360/month * 12)
        BigDecimal nssf = BigDecimal.valueOf(4_320);

        BigDecimal estimatedTax = tax.setScale(2, RoundingMode.HALF_UP);
        BigDecimal afterTax = annualIncome.subtract(estimatedTax).subtract(nssf)
                .setScale(2, RoundingMode.HALF_UP);

        return Map.of(
                "grossIncome",     annualIncome,
                "totalDeductions", nssf.setScale(2, RoundingMode.HALF_UP),
                "estimatedTax",    estimatedTax,
                "afterTax",        afterTax
        );
    }
}