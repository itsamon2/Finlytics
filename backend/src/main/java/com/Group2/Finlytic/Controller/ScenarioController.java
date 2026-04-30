package com.Group2.Finlytic.Controller;

import com.Group2.Finlytic.Model.Scenario;
import com.Group2.Finlytic.Service.CustomUserDetails;
import com.Group2.Finlytic.Service.ScenarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/scenarios")
public class ScenarioController {

    @Autowired
    private ScenarioService scenarioService;

    // ── Run scenario without saving ───────────────────────────────────────────
    @PostMapping("/run")
    public ResponseEntity<Map<String, Object>> runScenario(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, Object> body) {
        BigDecimal savingsGoalPercent = new BigDecimal(
                body.getOrDefault("savingsGoalPercent", "20").toString());
        Map<String, Object> result = scenarioService.runScenario(
                userDetails.getUserId(), savingsGoalPercent);
        return ResponseEntity.ok(result);
    }

    // ── Run and save scenario ─────────────────────────────────────────────────
    @PostMapping("/save")
    public ResponseEntity<Scenario> saveScenario(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, Object> body) {
        String scenarioName = body.getOrDefault("scenarioName", "My Scenario").toString();
        BigDecimal savingsGoalPercent = new BigDecimal(
                body.getOrDefault("savingsGoalPercent", "20").toString());
        Scenario saved = scenarioService.saveScenario(
                userDetails.getUserId(), scenarioName, savingsGoalPercent);
        return ResponseEntity.ok(saved);
    }

    // ── Get all saved scenarios ───────────────────────────────────────────────
    @GetMapping
    public List<Scenario> getSavedScenarios(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return scenarioService.getSavedScenarios(userDetails.getUserId());
    }

    // ── Delete a scenario ─────────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteScenario(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        scenarioService.deleteScenario(id, userDetails.getUserId());
        return ResponseEntity.ok(Map.of("success", true));
    }
}