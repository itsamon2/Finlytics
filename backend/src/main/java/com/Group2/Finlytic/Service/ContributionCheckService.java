package com.Group2.Finlytic.Service;

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

    // ── Main check — called by the controller when frontend loads ───────────
    // Returns all active goals that are due for a contribution check-in
    public List<GoalCheckInDTO> getDueCheckIns() {
        List<Goals> dueGoals = goalsService.getDueGoals();

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

    // ── User said YES — full or different amount ────────────────────────────
    public Goals confirmContribution(Long goalId, BigDecimal actualAmount) {
        return goalsService.recordContribution(goalId, actualAmount);
    }

    // ── User said NO — reschedule to a later date ───────────────────────────
    public Goals rescheduleContribution(Long goalId, LocalDate newDate) {
        return goalsService.rescheduleContribution(goalId, newDate);
    }

    // ── User wants to change their frequency after a missed contribution ────
    public Goals updateFrequencyAfterMiss(Long goalId, Integer newValue,
                                          com.Group2.Finlytic.Model.ContributionFrequencyUnit newUnit) {
        // Record today as last contribution date so the new frequency
        // starts calculating from now, then update the frequency
        Goals goal = goalsService.getGoalsById(goalId);
        goal.setLastContributionDate(LocalDate.now());
        goal.setMissedContributionDate(null);
        goalsService.updateGoals(goal);

        return goalsService.updateFrequency(goalId, newValue, newUnit);
    }

    // ── DTO — what the frontend receives per due goal ───────────────────────
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
            // Progress calculated here so frontend doesn't have to
            this.progressPercent        = targetAmount != null && targetAmount.compareTo(BigDecimal.ZERO) > 0
                    ? savedAmount.divide(targetAmount, 4, java.math.RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).doubleValue()
                    : 0;
        }
    }
}