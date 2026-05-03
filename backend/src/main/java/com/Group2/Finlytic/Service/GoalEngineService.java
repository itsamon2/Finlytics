package com.Group2.Finlytic.Service;

import com.Group2.Finlytic.Model.GoalStatus;
import com.Group2.Finlytic.Model.Goals;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class GoalEngineService {

    private final GoalsService goalsService;
    private final GoalAnalyticService analyticService;

    public GoalEngineService(GoalsService goalsService,
                             GoalAnalyticService analyticService) {
        this.goalsService = goalsService;
        this.analyticService = analyticService;
    }

    // Returns matched goalId, or null if no match
    public Long processSaving(Long userId, BigDecimal amount, String goalHint) {

        if (goalHint == null || goalHint.isBlank()) return null;

        List<Goals> goals = goalsService.getAllGoalsByUserId(userId)
                .stream()
                .filter(g -> g.getStatus() == GoalStatus.ACTIVE)
                .toList();

        Goals matched = matchGoal(goals, goalHint);

        if (matched != null) {
            goalsService.recordContribution(matched.getGoalId(), amount, userId);
            return matched.getGoalId();
        }

        return null;
    }

    private Goals matchGoal(List<Goals> goals, String hint) {
        String lowerHint = hint.toLowerCase();
        return goals.stream()
                .filter(g -> lowerHint.contains(g.getGoalName().toLowerCase())
                        || g.getGoalName().toLowerCase().contains(lowerHint))
                .findFirst()
                .orElse(null);
    }
}