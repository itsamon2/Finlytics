package com.Group2.Finlytic.Controller;

import com.Group2.Finlytic.Service.AdvisoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/advisory")
public class AdvisoryController {

    @Autowired
    private AdvisoryService advisoryService;

    @GetMapping("/check/{id}")
    public ResponseEntity<String> getAdvisory(@PathVariable("id") Long id) {
        try {
            String advice = advisoryService.advise(id);
            return ResponseEntity.ok(advice);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}