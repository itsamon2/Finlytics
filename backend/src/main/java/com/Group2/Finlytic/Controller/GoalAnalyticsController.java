package com.Group2.Finlytic.Controller;

import com.Group2.Finlytic.DTO.GoalPerformanceDTO;
import com.Group2.Finlytic.Service.GoalAnalyticService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/goals/analytics")
public class GoalAnalyticsController {

    @Autowired
    private GoalAnalyticService goalAnalyticService;

    @GetMapping("/{id}")
    public GoalPerformanceDTO getGoalAnalytics(@PathVariable Long id) {
        return new GoalPerformanceDTO(
                goalAnalyticService.calculateProgress(id),
                goalAnalyticService.calculateTimeProgress(id),
                goalAnalyticService.getPerformanceStatus(id),
                goalAnalyticService.getRemainingAmount(id),
                goalAnalyticService.getRequiredMonthlySaving(id)
        );
    }
}