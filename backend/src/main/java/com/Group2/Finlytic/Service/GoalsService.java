package com.Group2.Finlytic.Service;

import com.Group2.Finlytic.Model.ContributionFrequencyUnit;
import com.Group2.Finlytic.Model.GoalStatus;
import com.Group2.Finlytic.Model.Goals;
import com.Group2.Finlytic.repo.GoalsRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class GoalsService {

    @Autowired
    private GoalsRepo goalsRepo;

    // ── Existing methods (unchanged) ────────────────────────────────────────

    public Goals createGoals(Goals goals) {
        // Set lastContributionDate to creation date so the first due date
        // is calculated correctly from when the goal was set up
        if (goals.getLastContributionDate() == null) {
            goals.setLastContributionDate(LocalDate.now());
        }
        return goalsRepo.save(goals);
    }

    public Goals updateGoals(Goals goals) {
        return goalsRepo.save(goals);
    }

    public Goals updateStatus(Long goalId, GoalStatus newStatus) {
        Goals goal = goalsRepo.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found with id: " + goalId));
        goal.setStatus(newStatus);
        if (newStatus == GoalStatus.COMPLETED) {
            goal.setCompletionDate(LocalDate.now());
        }
        return goalsRepo.save(goal);
    }

    public List<Goals> getAllGoals() {
        return goalsRepo.findAll();
    }

    public Goals getGoalsById(Long goalId) {
        return goalsRepo.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found with id: " + goalId));
    }

    public List<Goals> getGoalsByName(String goal_name) {
        return goalsRepo.findByGoalNameContainingIgnoreCase(goal_name);
    }

    public void deleteGoal(Long goalId) {
        goalsRepo.deleteById(goalId);
    }

    // ── New methods ─────────────────────────────────────────────────────────

    // Calculates the next contribution date from lastContributionDate + frequency
    // Never stored — always derived
    public LocalDate getNextContributionDate(Goals goal) {
        if (goal.getLastContributionDate() == null
                || goal.getContributionFrequencyValue() == null
                || goal.getContributionFrequencyUnit() == null) {
            return null;
        }

        LocalDate base = goal.getLastContributionDate();
        int value = goal.getContributionFrequencyValue();
        ContributionFrequencyUnit unit = goal.getContributionFrequencyUnit();

        return switch (unit) {
            case DAYS   -> base.plusDays(value);
            case WEEKS  -> base.plusWeeks(value);
            case MONTHS -> base.plusMonths(value);
            case YEARS  -> base.plusYears(value);
        };
    }

    // Records a contribution — adds amount to savedAmount, updates lastContributionDate,
    // clears any missed/rescheduled date
    public Goals recordContribution(Long goalId, BigDecimal amount) {
        Goals goal = goalsRepo.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found with id: " + goalId));

        BigDecimal current = goal.getSavedAmount() != null ? goal.getSavedAmount() : BigDecimal.ZERO;
        goal.setSavedAmount(current.add(amount));
        goal.setLastContributionDate(LocalDate.now());
        goal.setMissedContributionDate(null); // clear any reschedule

        // Auto-complete if target reached
        if (goal.getSavedAmount().compareTo(goal.getTargetAmount()) >= 0) {
            goal.setStatus(GoalStatus.COMPLETED);
            goal.setCompletionDate(LocalDate.now());
        }

        return goalsRepo.save(goal);
    }

    // Stores a rescheduled date when user says "I'll contribute later"
    public Goals rescheduleContribution(Long goalId, LocalDate newDate) {
        Goals goal = goalsRepo.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found with id: " + goalId));
        goal.setMissedContributionDate(newDate);
        return goalsRepo.save(goal);
    }

    // Updates contribution frequency — used when user wants to change their period
    public Goals updateFrequency(Long goalId, Integer frequencyValue, ContributionFrequencyUnit frequencyUnit) {
        Goals goal = goalsRepo.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found with id: " + goalId));
        goal.setContributionFrequencyValue(frequencyValue);
        goal.setContributionFrequencyUnit(frequencyUnit);
        return goalsRepo.save(goal);
    }

    // Returns all goals where today >= nextContributionDate or today >= missedContributionDate
    // These are the goals that need a check-in prompt on the frontend
    public List<Goals> getDueGoals() {
        LocalDate today = LocalDate.now();
        return goalsRepo.findAll().stream()
                .filter(goal -> goal.getStatus() == GoalStatus.ACTIVE)
                .filter(goal -> {
                    // Check missed/rescheduled date first
                    if (goal.getMissedContributionDate() != null) {
                        return !today.isBefore(goal.getMissedContributionDate());
                    }
                    // Otherwise check calculated next contribution date
                    LocalDate next = getNextContributionDate(goal);
                    return next != null && !today.isBefore(next);
                })
                .toList();
    }
}