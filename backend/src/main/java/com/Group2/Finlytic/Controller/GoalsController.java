package com.Group2.Finlytic.Controller;

import com.Group2.Finlytic.Model.ContributionFrequencyUnit;
import com.Group2.Finlytic.Model.GoalStatus;
import com.Group2.Finlytic.Model.Goals;
import com.Group2.Finlytic.Service.AdvisoryService;
import com.Group2.Finlytic.Service.ContributionCheckService;
import com.Group2.Finlytic.Service.FeasibilityService;
import com.Group2.Finlytic.Service.GoalsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

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

    // ── Existing endpoints (unchanged) ──────────────────────────────────────

    @PostMapping
    public Goals createGoals(@RequestBody Goals goals) {
        return goalsService.createGoals(goals);
    }

    @GetMapping
    public List<Goals> getAllGoals() {
        return goalsService.getAllGoals();
    }

    @GetMapping("/{id}")
    public Goals getGoalsById(@PathVariable Long id) {
        return goalsService.getGoalsById(id);
    }

    @PutMapping
    public Goals updateGoals(@RequestBody Goals goals) {
        return goalsService.updateGoals(goals);
    }

    @PatchMapping("/id/{id}/status")
    public Goals updateStatus(@PathVariable Long id, @RequestParam GoalStatus status) {
        return goalsService.updateStatus(id, status);
    }

    @GetMapping("/search")
    public List<Goals> searchGoals(@RequestParam String goal_name) {
        return goalsService.getGoalsByName(goal_name);
    }

    @DeleteMapping("/{id}")
    public void deleteGoal(@PathVariable Long id) {
        goalsService.deleteGoal(id);
    }

    @GetMapping("/{id}/advisory")
    public ResponseEntity<String> getAdvisory(@PathVariable("id") Long id) {
        try {
            String advice = advisoryService.advise(id);
            return ResponseEntity.ok(advice);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/feasibility")
    public ResponseEntity<String> getFeasibility(@PathVariable("id") Long id) {
        try {
            String result = feasibilityService.feasibility(id);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ── New contribution check-in endpoints ─────────────────────────────────

    // Called on page load — returns all goals due for a check-in
    @GetMapping("/due-checkins")
    public ResponseEntity<List<ContributionCheckService.GoalCheckInDTO>> getDueCheckIns() {
        return ResponseEntity.ok(contributionCheckService.getDueCheckIns());
    }

    // User confirmed a contribution — full amount or different amount
    // POST /api/goals/{id}/contribute?amount=5000
    @PostMapping("/{id}/contribute")
    public ResponseEntity<Goals> confirmContribution(
            @PathVariable Long id,
            @RequestParam BigDecimal amount) {
        try {
            Goals updated = contributionCheckService.confirmContribution(id, amount);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // User said "I'll contribute later" — stores a rescheduled date
    // POST /api/goals/{id}/reschedule?newDate=2026-04-05
    @PostMapping("/{id}/reschedule")
    public ResponseEntity<Goals> rescheduleContribution(
            @PathVariable Long id,
            @RequestParam LocalDate newDate) {
        try {
            Goals updated = contributionCheckService.rescheduleContribution(id, newDate);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // User wants to change their contribution frequency
    // POST /api/goals/{id}/frequency?value=5&unit=DAYS
    @PostMapping("/{id}/frequency")
    public ResponseEntity<Goals> updateFrequency(
            @PathVariable Long id,
            @RequestParam Integer value,
            @RequestParam ContributionFrequencyUnit unit) {
        try {
            Goals updated = contributionCheckService.updateFrequencyAfterMiss(id, value, unit);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Returns the calculated next contribution date for a goal
    // GET /api/goals/{id}/next-contribution
    @GetMapping("/{id}/next-contribution")
    public ResponseEntity<LocalDate> getNextContributionDate(@PathVariable Long id) {
        try {
            Goals goal = goalsService.getGoalsById(id);
            LocalDate next = goalsService.getNextContributionDate(goal);
            return next != null ? ResponseEntity.ok(next) : ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}