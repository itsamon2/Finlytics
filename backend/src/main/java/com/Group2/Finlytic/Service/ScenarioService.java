package com.Group2.Finlytic.Service;

import com.Group2.Finlytic.Model.Scenario;
import com.Group2.Finlytic.repo.ScenarioRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;

@Service
public class ScenarioService {

    @Autowired
    private ScenarioRepo scenarioRepo;

    @Autowired
    private TransactionsService transactionsService;

    // ── PAYE calculation (monthly) ────────────────────────────────────────────
    private BigDecimal calculatePAYE(BigDecimal monthlyGross) {
        BigDecimal annual = monthlyGross.multiply(BigDecimal.valueOf(12));
        BigDecimal tax;

        if (annual.compareTo(BigDecimal.valueOf(288000)) <= 0) {
            tax = annual.multiply(BigDecimal.valueOf(0.10));
        } else if (annual.compareTo(BigDecimal.valueOf(387996)) <= 0) {
            tax = BigDecimal.valueOf(28800)
                    .add(annual.subtract(BigDecimal.valueOf(288000))
                            .multiply(BigDecimal.valueOf(0.25)));
        } else if (annual.compareTo(BigDecimal.valueOf(6000000)) <= 0) {
            tax = BigDecimal.valueOf(28800 + 24999)
                    .add(annual.subtract(BigDecimal.valueOf(387996))
                            .multiply(BigDecimal.valueOf(0.30)));
        } else if (annual.compareTo(BigDecimal.valueOf(9600000)) <= 0) {
            tax = BigDecimal.valueOf(28800 + 24999)
                    .add(BigDecimal.valueOf(1683601).multiply(BigDecimal.valueOf(0.30)))
                    .add(annual.subtract(BigDecimal.valueOf(6000000))
                            .multiply(BigDecimal.valueOf(0.325)));
        } else {
            tax = BigDecimal.valueOf(28800 + 24999)
                    .add(BigDecimal.valueOf(1683601).multiply(BigDecimal.valueOf(0.30)))
                    .add(BigDecimal.valueOf(1170000).multiply(BigDecimal.valueOf(0.325)))
                    .add(annual.subtract(BigDecimal.valueOf(9600000))
                            .multiply(BigDecimal.valueOf(0.35)));
        }

        // Personal relief Ksh 2,400/month
        BigDecimal monthlyTax = tax.divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP)
                .subtract(BigDecimal.valueOf(2400));
        return monthlyTax.max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
    }

    // ── NHIF calculation ──────────────────────────────────────────────────────
    private BigDecimal calculateNHIF(BigDecimal monthlyGross) {
        double gross = monthlyGross.doubleValue();
        if (gross < 6000)   return BigDecimal.valueOf(150);
        if (gross < 8000)   return BigDecimal.valueOf(300);
        if (gross < 12000)  return BigDecimal.valueOf(400);
        if (gross < 15000)  return BigDecimal.valueOf(500);
        if (gross < 20000)  return BigDecimal.valueOf(600);
        if (gross < 25000)  return BigDecimal.valueOf(750);
        if (gross < 30000)  return BigDecimal.valueOf(850);
        if (gross < 35000)  return BigDecimal.valueOf(900);
        if (gross < 40000)  return BigDecimal.valueOf(950);
        if (gross < 45000)  return BigDecimal.valueOf(1000);
        if (gross < 50000)  return BigDecimal.valueOf(1100);
        if (gross < 60000)  return BigDecimal.valueOf(1200);
        if (gross < 70000)  return BigDecimal.valueOf(1300);
        if (gross < 80000)  return BigDecimal.valueOf(1400);
        if (gross < 90000)  return BigDecimal.valueOf(1500);
        if (gross < 100000) return BigDecimal.valueOf(1600);
        return BigDecimal.valueOf(1700);
    }

    // ── Wellness score ────────────────────────────────────────────────────────
    private int calculateWellnessScore(double savingsRate,
                                       double deductionRate,
                                       double expenseRate) {
        int score = 0;
        if (savingsRate >= 30)      score += 50;
        else if (savingsRate >= 20) score += 40;
        else if (savingsRate >= 10) score += 25;
        else if (savingsRate >= 5)  score += 10;

        if (deductionRate <= 15)      score += 20;
        else if (deductionRate <= 25) score += 15;
        else if (deductionRate <= 35) score += 8;

        if (expenseRate <= 40)      score += 30;
        else if (expenseRate <= 55) score += 20;
        else if (expenseRate <= 70) score += 10;

        return Math.min(score, 100);
    }

    // ── Core calculation engine ───────────────────────────────────────────────
    private Map<String, Object> calculate(BigDecimal grossIncome,
                                          BigDecimal monthlyExpenses,
                                          BigDecimal savingsGoalPercent) {
        BigDecimal paye  = calculatePAYE(grossIncome);
        BigDecimal nhif  = calculateNHIF(grossIncome);
        BigDecimal nssf  = BigDecimal.valueOf(1080);
        BigDecimal totalDeductions = paye.add(nhif).add(nssf);
        BigDecimal netIncome       = grossIncome.subtract(totalDeductions);
        BigDecimal monthlySavings  = netIncome.subtract(monthlyExpenses)
                .max(BigDecimal.ZERO);
        BigDecimal annualSavings   = monthlySavings.multiply(BigDecimal.valueOf(12));
        BigDecimal fiveYearSavings = monthlySavings.multiply(BigDecimal.valueOf(60));

        BigDecimal savingsRate = netIncome.compareTo(BigDecimal.ZERO) > 0
                ? monthlySavings.divide(netIncome, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal deductionRate = grossIncome.compareTo(BigDecimal.ZERO) > 0
                ? totalDeductions.divide(grossIncome, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;

        BigDecimal expenseRate = netIncome.compareTo(BigDecimal.ZERO) > 0
                ? monthlyExpenses.divide(netIncome, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                : BigDecimal.valueOf(100);

        int wellnessScore = calculateWellnessScore(
                savingsRate.doubleValue(),
                deductionRate.doubleValue(),
                expenseRate.doubleValue()
        );

        BigDecimal goalAmount = savingsGoalPercent != null
                ? netIncome.multiply(savingsGoalPercent
                .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP))
                : BigDecimal.ZERO;

        BigDecimal savingsGap = goalAmount.subtract(monthlySavings);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("grossIncome",      grossIncome);
        result.put("monthlyExpenses",  monthlyExpenses);
        result.put("savingsGoalPercent", savingsGoalPercent);
        result.put("paye",             paye);
        result.put("nhif",             nhif);
        result.put("nssf",             nssf);
        result.put("totalDeductions",  totalDeductions);
        result.put("netIncome",        netIncome);
        result.put("monthlySavings",   monthlySavings);
        result.put("annualSavings",    annualSavings);
        result.put("fiveYearSavings",  fiveYearSavings);
        result.put("savingsRate",      savingsRate);
        result.put("deductionRate",    deductionRate.setScale(2, RoundingMode.HALF_UP));
        result.put("expenseRate",      expenseRate.setScale(2, RoundingMode.HALF_UP));
        result.put("wellnessScore",    wellnessScore);
        result.put("goalAmount",       goalAmount);
        result.put("savingsGap",       savingsGap);
        return result;
    }

    // ── Run without saving ────────────────────────────────────────────────────
    public Map<String, Object> runScenario(Long userId, BigDecimal savingsGoalPercent) {
        BigDecimal grossIncome     = transactionsService.getMonthlyIncome(userId);
        BigDecimal monthlyExpenses = transactionsService.getMonthlyExpensesByCategory(userId)
                .values().stream().reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> result = calculate(grossIncome, monthlyExpenses, savingsGoalPercent);
        result.put("grossIncome",     grossIncome);
        result.put("monthlyExpenses", monthlyExpenses);
        return result;
    }

    // ── Run and save ──────────────────────────────────────────────────────────
    public Scenario saveScenario(Long userId, String scenarioName,
                                 BigDecimal savingsGoalPercent) {
        BigDecimal grossIncome     = transactionsService.getMonthlyIncome(userId);
        BigDecimal monthlyExpenses = transactionsService.getMonthlyExpensesByCategory(userId)
                .values().stream().reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> calc = calculate(grossIncome, monthlyExpenses, savingsGoalPercent);

        Scenario scenario = new Scenario();
        scenario.setUserId(userId);
        scenario.setScenarioName(scenarioName);
        scenario.setGrossIncome(grossIncome);
        scenario.setMonthlyExpenses(monthlyExpenses);
        scenario.setSavingsGoalPercent(savingsGoalPercent);
        scenario.setPaye((BigDecimal) calc.get("paye"));
        scenario.setNhif((BigDecimal) calc.get("nhif"));
        scenario.setNssf((BigDecimal) calc.get("nssf"));
        scenario.setTotalDeductions((BigDecimal) calc.get("totalDeductions"));
        scenario.setNetIncome((BigDecimal) calc.get("netIncome"));
        scenario.setMonthlySavings((BigDecimal) calc.get("monthlySavings"));
        scenario.setAnnualSavings((BigDecimal) calc.get("annualSavings"));
        scenario.setFiveYearSavings((BigDecimal) calc.get("fiveYearSavings"));
        scenario.setSavingsRate((BigDecimal) calc.get("savingsRate"));
        scenario.setWellnessScore((Integer) calc.get("wellnessScore"));
        return scenarioRepo.save(scenario);
    }

    // ── Get saved scenarios ───────────────────────────────────────────────────
    public List<Scenario> getSavedScenarios(Long userId) {
        return scenarioRepo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // ── Delete scenario ───────────────────────────────────────────────────────
    public void deleteScenario(Long scenarioId, Long userId) {
        scenarioRepo.findByScenarioIdAndUserId(scenarioId, userId)
                .ifPresent(scenarioRepo::delete);
    }
}