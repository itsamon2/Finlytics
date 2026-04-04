package com.Group2.Finlytic.Controller;

import com.Group2.Finlytic.Service.FeasibilityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/feasibility")
public class FeasibilityController {

    @Autowired
    FeasibilityService feasibilityService;

    @GetMapping("/check/{goalId}")
    public ResponseEntity<String> checkFeasibility(@PathVariable Long goalId,Long userId) {
        String result = feasibilityService.feasibility(goalId,userId);
        return ResponseEntity.ok(result);
    }
}
