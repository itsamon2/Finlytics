package com.Group2.Finlytic.Controller;

import com.Group2.Finlytic.Model.GoalStatus;
import com.Group2.Finlytic.Model.Goals;
import com.Group2.Finlytic.Service.GoalsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/goals")
public class GoalsController {

    @Autowired
    private GoalsService goalsService;

    // Create a new goal
    @PostMapping
    public Goals createGoals(@RequestBody Goals goals) {
        return goalsService.createGoals(goals);
    }

    // Get all goals
    @GetMapping
    public List<Goals> getAllGoals() {
        return goalsService.getAllGoals();
    }

    // Get goal by ID
    @GetMapping("/{id}")
    public Goals getGoalsById(@PathVariable Long id) {
        return goalsService.getGoalsById(id);
    }

    // Update full goal details
    @PutMapping
    public Goals updateGoals(@RequestBody Goals goals) {
        return goalsService.updateGoals(goals);
    }

    // Update only goal status (ACTIVE, PAUSED, COMPLETED)
    @PatchMapping("/id/{id}/status")
    public Goals updateStatus(@PathVariable Long id, @RequestParam GoalStatus status) {
        return goalsService.updateStatus(id, status);
    }


    @GetMapping("/search")
    public List<Goals> searchGoals(@RequestParam String goal_name){
        return goalsService.getGoalsByName(goal_name);
    }
}