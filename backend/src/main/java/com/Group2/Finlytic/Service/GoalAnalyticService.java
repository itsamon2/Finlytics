package com.Group2.Finlytic.Service;

import com.Group2.Finlytic.Model.Goals;
import com.Group2.Finlytic.repo.GoalsRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Service
public class GoalAnalyticService {

    @Autowired
    private GoalsRepo goalsRepo;

    @Autowired
    private GoalsService goalsService;

    public double calculateProgress(Long goalId) {
        Goals goals = goalsService.getGoalsById(goalId);

        if (goals == null) {
            throw new RuntimeException("Goal not found with id: " + goalId);
        }

        BigDecimal targetAmount = goals.getTargetAmount();
        BigDecimal saved = goals.getSavedAmount();

        if (targetAmount == null || targetAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("The target amount must be greater than zero: " + targetAmount);
        }

        if (saved == null) {
            saved = BigDecimal.ZERO;
        }

        BigDecimal progress =
                saved.divide(targetAmount, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100"));

        return progress.doubleValue();
    }
    public double calculateTimeProgress(Long goalId) {
        Goals goal = goalsService.getGoalsById(goalId);

        if (goal.getCreationDate() == null || goal.getTargetDate() == null) {
            throw new RuntimeException("Goal dates are not set");
        }

        LocalDate start = goal.getCreationDate();
        LocalDate end = goal.getTargetDate();
        LocalDate today = LocalDate.now();

        long totalDays = ChronoUnit.DAYS.between(start, end);
        if (totalDays <= 0) {
            throw new RuntimeException("Invalid goal duration: target date must be after creation date");
        }

        long daysPassed = ChronoUnit.DAYS.between(start, today);
        daysPassed = Math.min(daysPassed, totalDays);

        double timeProgress = ((double) daysPassed / totalDays) * 100;

        return timeProgress;
    }

    public String getPerformanceStatus(Long goalId) {
        double savingProgress = calculateProgress(goalId);
        double timeProgress = calculateTimeProgress(goalId);

        if (savingProgress >= timeProgress) {
            return "Ahead of schedule";
        } else {
            return "Behind schedule";
        }
    }
    public BigDecimal getRemainingAmount(Long goalId) {
        Goals goal = goalsService.getGoalsById(goalId);
        BigDecimal saved = goal.getSavedAmount() != null ? goal.getSavedAmount() : BigDecimal.ZERO;
        return goal.getTargetAmount().subtract(saved);
    }

    public BigDecimal getRequiredMonthlySaving(Long goalId) {
        Goals goal = goalsService.getGoalsById(goalId);
        BigDecimal remaining = getRemainingAmount(goalId);

        long monthsLeft = ChronoUnit.MONTHS.between(LocalDate.now(), goal.getTargetDate());
        if (monthsLeft <= 0) monthsLeft = 1; // avoid division by zero

        return remaining.divide(new BigDecimal(monthsLeft), 2, RoundingMode.HALF_UP);
    }
}