package com.Group2.Finlytic.Controller;

import com.Group2.Finlytic.Service.AdvisoryService;
import com.Group2.Finlytic.Service.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/advisory")
public class AdvisoryController {

    @Autowired
    private AdvisoryService advisoryService;

    @GetMapping("/check/{id}")
    public ResponseEntity<String> getAdvisory(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            String advice = advisoryService.advise(id, userDetails.getUserId());
            return ResponseEntity.ok(advice);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}