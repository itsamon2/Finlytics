package com.Group2.Finlytic.Service;

import com.Group2.Finlytic.Model.GoalStatus;
import com.Group2.Finlytic.Model.Goals;
import com.Group2.Finlytic.repo.GoalsRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class GoalsService {

    @Autowired
    private GoalsRepo goalsRepo;

    public Goals createGoals(Goals goals) {
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
}