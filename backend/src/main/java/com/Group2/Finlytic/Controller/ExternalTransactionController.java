package com.Group2.Finlytic.Controller;

import com.Group2.Finlytic.DTO.MpesaTransactionRequest;
import com.Group2.Finlytic.Model.Transactions;
import com.Group2.Finlytic.Model.User;
import com.Group2.Finlytic.Service.TransactionsService;
import com.Group2.Finlytic.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ExternalTransactionController {

    @Autowired
    private TransactionsService transactionsService;

    @Autowired
    private UserRepo userRepo;

    @PostMapping("/mpesa")
    public ResponseEntity<?> receiveMpesaTransaction(
            @RequestBody MpesaTransactionRequest request,
            @RequestHeader("X-Api-Key") String apiKey) {

        // Simple shared-secret auth between the two apps
        String expectedKey = System.getenv("INTERNAL_API_KEY");
if (expectedKey == null || !expectedKey.equals(apiKey)) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(Map.of("error", "Invalid API key"));
}

        // Look up user by mobile number
        User user = userRepo.findByPhoneNumber(request.getPhoneNumber())
                .orElseThrow(() -> new RuntimeException("User not found for number: " + request.getPhoneNumber()));

        Transactions transaction = new Transactions();
        transaction.setUserId(user.getId());
        transaction.setRawMessage(request.getRawSmsMessage()); // your existing categorization kicks in here
        transaction.setCreationDate(LocalDate.now());

        transactionsService.saveTransaction(transaction);

        return ResponseEntity.ok(Map.of("status", "received"));
    }
}
