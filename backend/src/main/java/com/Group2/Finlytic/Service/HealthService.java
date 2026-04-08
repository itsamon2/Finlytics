package com.Group2.Finlytic.Service;

import com.Group2.Finlytic.Model.ContributionFrequencyUnit;
import com.Group2.Finlytic.Model.Goals;
import com.Group2.Finlytic.Model.IncomeProfile;
import com.Group2.Finlytic.repo.GoalsRepo;
import com.Group2.Finlytic.repo.IncomeProfileRepo;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class HealthService {

    private final GoalsRepo goalsRepo;
    private final IncomeProfileRepo incomeProfileRepo;

    public HealthService(GoalsRepo goalsRepo, IncomeProfileRepo incomeProfileRepo) {
        this.goalsRepo = goalsRepo;
        this.incomeProfileRepo = incomeProfileRepo;
    }

    public int calculateSavingsRate(Long userId) {

        List<Goals> goals = goalsRepo.findByUserIdAndGoalType(userId, "SAVINGS");

        if (goals == null || goals.isEmpty()) {
            return 0;
        }

        BigDecimal totalSaved = BigDecimal.ZERO;
        for (Goals g : goals) {
            if (g.getSavedAmount() != null) {
                totalSaved = totalSaved.add(g.getSavedAmount());
            }
        }

        Optional<IncomeProfile> incomeProfile = incomeProfileRepo.findByUserId(userId);
        if (incomeProfile.isEmpty()) {
            return 0;
        }

        BigDecimal totalIncome = incomeProfile.get().getDeclaredMonthlyIncome();

        if (totalIncome.compareTo(BigDecimal.ZERO) == 0) {
            return 0;
        }

        BigDecimal savingsRate = totalSaved
                .divide(totalIncome, 2, BigDecimal.ROUND_HALF_UP)
                .multiply(BigDecimal.valueOf(100));

        return savingsRate.intValue();
    }

    public BigDecimal getMonthlyDebt(Long userId) {

        List<Goals> debts = goalsRepo.findByUserIdAndGoalType(userId, "DEBT");

        BigDecimal totalMonthlyDebt = BigDecimal.ZERO;

        for (Goals debt : debts) {

            BigDecimal amount = debt.getContributionAmount();
            ContributionFrequencyUnit unit = debt.getContributionFrequencyUnit();
            Integer value = debt.getContributionFrequencyValue();

            if (amount == null || unit == null || value == null || value == 0) {
                continue;
            }

            BigDecimal monthlyEquivalent = BigDecimal.ZERO;

            switch (unit) {

                case DAYS:
                    monthlyEquivalent = amount.multiply(
                            BigDecimal.valueOf(30)
                                    .divide(BigDecimal.valueOf(value), 2, RoundingMode.HALF_UP)
                    );
                    break;

                case MONTHS:
                    monthlyEquivalent = amount.divide(
                            BigDecimal.valueOf(value), 2, RoundingMode.HALF_UP
                    );
                    break;

                case YEARS:
                    monthlyEquivalent = amount.divide(
                            BigDecimal.valueOf(value * 12), 2, RoundingMode.HALF_UP
                    );
                    break;

                default:
                    continue;
            }

            totalMonthlyDebt = totalMonthlyDebt.add(monthlyEquivalent);
        }

        return totalMonthlyDebt;
    }

    public int calculateDTI(Long userId) {

        BigDecimal monthlyDebt = getMonthlyDebt(userId);

        Optional<IncomeProfile> incomeOpt = incomeProfileRepo.findByUserId(userId);
        if (incomeOpt.isEmpty()) return 0;

        BigDecimal income = incomeOpt.get().getDeclaredMonthlyIncome();

        if (income.compareTo(BigDecimal.ZERO) == 0) {
            return 0;
        }

        BigDecimal dti = monthlyDebt
                .divide(income, 2, BigDecimal.ROUND_HALF_UP)
                .multiply(BigDecimal.valueOf(100));

        return dti.intValue();
    }

    public int calculateEmergencyFundCoverage(Long userId) {

        List<Goals> emergencyGoals = goalsRepo.findByUserIdAndGoalType(userId, "EMERGENCY_FUND");

        if (emergencyGoals == null || emergencyGoals.isEmpty()) {
            return 0;
        }

        BigDecimal totalSaved = BigDecimal.ZERO;
        BigDecimal totalTarget = BigDecimal.ZERO;

        for (Goals g : emergencyGoals) {
            if (g.getSavedAmount() != null) {
                totalSaved = totalSaved.add(g.getSavedAmount());
            }
            if (g.getTargetAmount() != null) {
                totalTarget = totalTarget.add(g.getTargetAmount());
            }
        }

        if (totalTarget.compareTo(BigDecimal.ZERO) == 0) {
            return 0;
        }

        BigDecimal coverage = totalSaved
                .divide(totalTarget, 2, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));

        return Math.min(coverage.intValue(), 100);
    }

    public BigDecimal calculateInvestmentGrowth(Long userId) {

        List<Goals> investments = goalsRepo.findByUserIdAndGoalType(userId, "INVESTMENT");

        if (investments == null || investments.isEmpty()) {
            return BigDecimal.ZERO;
        }

        BigDecimal totalSaved = BigDecimal.ZERO;
        BigDecimal totalTarget = BigDecimal.ZERO;

        for (Goals g : investments) {
            if (g.getSavedAmount() != null) {
                totalSaved = totalSaved.add(g.getSavedAmount());
            }
            if (g.getTargetAmount() != null) {
                totalTarget = totalTarget.add(g.getTargetAmount());
            }
        }

        if (totalTarget.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }

        return totalSaved
                .divide(totalTarget, 3, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(1, RoundingMode.HALF_UP);
    }

    public Map<String, Object> calculateFinancialHealthScore(Long userId) {

        int savingsRate         = calculateSavingsRate(userId);
        int dti                 = calculateDTI(userId);
        int emergencyFund       = calculateEmergencyFundCoverage(userId);
        BigDecimal investmentGrowth = calculateInvestmentGrowth(userId);

        int savingsScore    = Math.min((savingsRate * 100) / 50, 100);
        int dtiScore        = Math.max(0, 100 - (dti * 100 / 36));
        int emergencyScore  = Math.min(emergencyFund, 100);
        int investmentScore = Math.min(
                investmentGrowth.multiply(BigDecimal.valueOf(10)).intValue(), 100
        );

        int finalScore = (int) Math.round(
                (savingsScore    * 0.30) +
                        (dtiScore        * 0.30) +
                        (emergencyScore  * 0.25) +
                        (investmentScore * 0.15)
        );

        String label;
        if      (finalScore >= 80) label = "Excellent financial stability";
        else if (finalScore >= 60) label = "Good financial health";
        else if (finalScore >= 40) label = "Fair — room for improvement";
        else                       label = "Needs attention";

        return Map.of(
                "score",  finalScore,
                "label",  label,
                "breakdown", Map.of(
                        "savingsScore",    savingsScore,
                        "dtiScore",        dtiScore,
                        "emergencyScore",  emergencyScore,
                        "investmentScore", investmentScore
                )
        );
    }
}