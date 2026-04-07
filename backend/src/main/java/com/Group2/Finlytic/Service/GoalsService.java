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

    public Goals createGoals(Goals goals) {
        if (goals.getLastContributionDate() == null) {
            goals.setLastContributionDate(LocalDate.now());
        }
        return goalsRepo.save(goals);
    }

    public Goals updateGoals(Goals goals) {
        return goalsRepo.save(goals);
    }

    public Goals updateStatus(Long goalId, GoalStatus newStatus, Long userId) {
        Goals goal = goalsRepo.findByGoalIdAndUserId(goalId, userId)  // ✅
                .orElseThrow(() -> new RuntimeException("Goal not found"));
        goal.setStatus(newStatus);
        if (newStatus == GoalStatus.COMPLETED) {
            goal.setCompletionDate(LocalDate.now());
        }
        return goalsRepo.save(goal);
    }

    public List<Goals> getAllGoalsByUserId(Long userId) {
        return goalsRepo.findByUserId(userId);
    }

    public Goals getGoalsById(Long goalId) {
        return goalsRepo.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found with id: " + goalId));
    }

    public Goals getGoalsByIdAndUserId(Long goalId, Long userId) {
        return goalsRepo.findByGoalIdAndUserId(goalId, userId)  // ✅
                .orElseThrow(() -> new RuntimeException("Goal not found"));
    }

    public List<Goals> getGoalsByNameAndUserId(String goalName, Long userId) {
        return goalsRepo.findByGoalNameContainingIgnoreCaseAndUserId(goalName, userId);  // ✅
    }

    public void deleteGoal(Long goalId, Long userId) {
        goalsRepo.findByGoalIdAndUserId(goalId, userId)
                .ifPresent(goal -> goalsRepo.deleteById(goalId));
    }

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

    public Goals recordContribution(Long goalId, BigDecimal amount, Long userId) {
        Goals goal = goalsRepo.findByGoalIdAndUserId(goalId, userId)  // ✅
                .orElseThrow(() -> new RuntimeException("Goal not found"));
        BigDecimal current = goal.getSavedAmount() != null ? goal.getSavedAmount() : BigDecimal.ZERO;
        goal.setSavedAmount(current.add(amount));
        goal.setLastContributionDate(LocalDate.now());
        goal.setMissedContributionDate(null);
        if (goal.getSavedAmount().compareTo(goal.getTargetAmount()) >= 0) {
            goal.setStatus(GoalStatus.COMPLETED);
            goal.setCompletionDate(LocalDate.now());
        }
        return goalsRepo.save(goal);
    }

    public Goals rescheduleContribution(Long goalId, LocalDate newDate, Long userId) {
        Goals goal = goalsRepo.findByGoalIdAndUserId(goalId, userId)  // ✅
                .orElseThrow(() -> new RuntimeException("Goal not found"));
        goal.setMissedContributionDate(newDate);
        return goalsRepo.save(goal);
    }

    public Goals updateFrequency(Long goalId, Integer frequencyValue, ContributionFrequencyUnit frequencyUnit, Long userId) {
        Goals goal = goalsRepo.findByGoalIdAndUserId(goalId, userId)  // ✅
                .orElseThrow(() -> new RuntimeException("Goal not found"));
        goal.setContributionFrequencyValue(frequencyValue);
        goal.setContributionFrequencyUnit(frequencyUnit);
        return goalsRepo.save(goal);
    }

    public List<Goals> getDueGoals(Long userId) {
        LocalDate today = LocalDate.now();
        return goalsRepo.findByUserId(userId).stream()  // ✅
                .filter(goal -> goal.getStatus() == GoalStatus.ACTIVE)
                .filter(goal -> {
                    if (goal.getMissedContributionDate() != null) {
                        return !today.isBefore(goal.getMissedContributionDate());
                    }
                    LocalDate next = getNextContributionDate(goal);
                    return next != null && !today.isBefore(next);
                })
                .toList();
    }
}