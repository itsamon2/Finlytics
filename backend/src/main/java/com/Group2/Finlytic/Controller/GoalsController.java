package com.Group2.Finlytic.Controller;

import com.Group2.Finlytic.Model.ContributionFrequencyUnit;
import com.Group2.Finlytic.Model.GoalStatus;
import com.Group2.Finlytic.Model.Goals;
import com.Group2.Finlytic.Service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.Group2.Finlytic.Model.ContributionFrequencyUnit;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
@RestController
@RequestMapping("/api/goals")
public class GoalsController {

    @Autowired
    private GoalsService goalsService;

    @Autowired
    private AdvisoryService advisoryService;

    @Autowired
    private FeasibilityService feasibilityService;

    @Autowired
    private ContributionCheckService contributionCheckService;

    @PostMapping
    public Goals createGoals(@RequestBody Goals goals,
                             @AuthenticationPrincipal CustomUserDetails userDetails) {
        goals.setUserId(userDetails.getUserId()); // ✅ scope to user
        return goalsService.createGoals(goals);
    }

    @GetMapping
    public List<Goals> getAllGoals(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return goalsService.getAllGoalsByUserId(userDetails.getUserId()); // ✅
    }

    @GetMapping("/{id}")
    public Goals getGoalsById(@PathVariable Long id,
                              @AuthenticationPrincipal CustomUserDetails userDetails) {
        return goalsService.getGoalsByIdAndUserId(id, userDetails.getUserId()); // ✅
    }

    @PutMapping
    public Goals updateGoals(@RequestBody Goals goals,
                             @AuthenticationPrincipal CustomUserDetails userDetails) {
        goals.setUserId(userDetails.getUserId()); // ✅
        return goalsService.updateGoals(goals);
    }

    @PatchMapping("/id/{id}/status")
    public Goals updateStatus(@PathVariable Long id,
                              @RequestParam GoalStatus status,
                              @AuthenticationPrincipal CustomUserDetails userDetails) {
        return goalsService.updateStatus(id, status, userDetails.getUserId()); // ✅
    }

    @GetMapping("/search")
    public List<Goals> searchGoals(@RequestParam String goal_name,
                                   @AuthenticationPrincipal CustomUserDetails userDetails) {
        return goalsService.getGoalsByNameAndUserId(goal_name, userDetails.getUserId()); // ✅
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteGoal(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        goalsService.deleteGoal(id, userDetails.getUserId());
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/{id}/advisory")
    public ResponseEntity<String> getAdvisory(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) { // ✅ was a plain Long param
        try {
            String advice = advisoryService.advise(id, userDetails.getUserId());
            return ResponseEntity.ok(advice);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/feasibility")
    public ResponseEntity<String> getFeasibility(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) { // ✅ was a plain Long param
        try {
            String result = feasibilityService.feasibility(id, userDetails.getUserId());
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/due-checkins")
    public ResponseEntity<List<ContributionCheckService.GoalCheckInDTO>> getDueCheckIns(
            @AuthenticationPrincipal CustomUserDetails userDetails) { // ✅
        return ResponseEntity.ok(contributionCheckService.getDueCheckIns(userDetails.getUserId()));
    }

    @PostMapping("/{id}/contribute")
    public ResponseEntity<Goals> confirmContribution(
            @PathVariable Long id,
            @RequestParam BigDecimal amount,
            @AuthenticationPrincipal CustomUserDetails userDetails) { // ✅
        try {
            Goals updated = contributionCheckService.confirmContribution(id, amount, userDetails.getUserId());
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/reschedule")
    public ResponseEntity<Goals> rescheduleContribution(
            @PathVariable Long id,
            @RequestParam LocalDate newDate,
            @AuthenticationPrincipal CustomUserDetails userDetails) { // ✅
        try {
            Goals updated = contributionCheckService.rescheduleContribution(id, newDate, userDetails.getUserId());
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/frequency")
    public ResponseEntity<Goals> updateFrequency(
            @PathVariable Long id,
            @RequestParam Integer value,
            @RequestParam ContributionFrequencyUnit unit,
            @AuthenticationPrincipal CustomUserDetails userDetails) { // ✅
        try {
            Goals updated = contributionCheckService.updateFrequencyAfterMiss(id, value, unit, userDetails.getUserId());
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/next-contribution")
    public ResponseEntity<LocalDate> getNextContributionDate(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) { // ✅
        try {
            Goals goal = goalsService.getGoalsByIdAndUserId(id, userDetails.getUserId());
            LocalDate next = goalsService.getNextContributionDate(goal);
            return next != null ? ResponseEntity.ok(next) : ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}