package com.Group2.Finlytic.Service;

import com.Group2.Finlytic.Model.ContributionFrequencyUnit;
import com.Group2.Finlytic.Model.Goals;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
@Service
public class ContributionCheckService {

    @Autowired
    private GoalsService goalsService;

    public List<GoalCheckInDTO> getDueCheckIns(Long userId) {  // ✅
        List<Goals> dueGoals = goalsService.getDueGoals(userId);  // ✅

        return dueGoals.stream()
                .map(goal -> new GoalCheckInDTO(
                        goal.getGoalId(),
                        goal.getGoalName(),
                        goal.getGoalType(),
                        goal.getContributionAmount(),
                        goalsService.getNextContributionDate(goal),
                        goal.getMissedContributionDate(),
                        goal.getSavedAmount(),
                        goal.getTargetAmount()
                ))
                .toList();
    }

    public Goals confirmContribution(Long goalId, BigDecimal actualAmount, Long userId) {  // ✅
        return goalsService.recordContribution(goalId, actualAmount, userId);  // ✅
    }

    public Goals rescheduleContribution(Long goalId, LocalDate newDate, Long userId) {  // ✅
        return goalsService.rescheduleContribution(goalId, newDate, userId);  // ✅
    }

    public Goals updateFrequencyAfterMiss(Long goalId, Integer newValue,
                                          ContributionFrequencyUnit newUnit, Long userId) {  // ✅
        Goals goal = goalsService.getGoalsByIdAndUserId(goalId, userId);  // ✅
        goal.setLastContributionDate(LocalDate.now());
        goal.setMissedContributionDate(null);
        goalsService.updateGoals(goal);
        return goalsService.updateFrequency(goalId, newValue, newUnit, userId);  // ✅
    }

    public static class GoalCheckInDTO {
        public Long goalId;
        public String goalName;
        public String goalType;
        public BigDecimal expectedAmount;
        public LocalDate nextContributionDate;
        public LocalDate missedContributionDate;
        public BigDecimal savedAmount;
        public BigDecimal targetAmount;
        public double progressPercent;

        public GoalCheckInDTO(Long goalId, String goalName, String goalType,
                              BigDecimal expectedAmount, LocalDate nextContributionDate,
                              LocalDate missedContributionDate, BigDecimal savedAmount,
                              BigDecimal targetAmount) {
            this.goalId                 = goalId;
            this.goalName               = goalName;
            this.goalType               = goalType;
            this.expectedAmount         = expectedAmount;
            this.nextContributionDate   = nextContributionDate;
            this.missedContributionDate = missedContributionDate;
            this.savedAmount            = savedAmount;
            this.targetAmount           = targetAmount;
            this.progressPercent        = targetAmount != null && targetAmount.compareTo(BigDecimal.ZERO) > 0
                    ? savedAmount.divide(targetAmount, 4, java.math.RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).doubleValue()
                    : 0;
        }
    }
}