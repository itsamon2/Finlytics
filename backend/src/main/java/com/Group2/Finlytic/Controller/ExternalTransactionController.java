package com.Group2.Finlytic.Controller;

import com.Group2.Finlytic.DTO.MpesaTransactionRequest;
import com.Group2.Finlytic.Model.Transactions;
import com.Group2.Finlytic.Model.User;
import com.Group2.Finlytic.Service.TransactionsService;
import com.Group2.Finlytic.repo.UserRepo;
import com.Group2.Finlytic.repo.Transactionsrepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class ExternalTransactionController {

    @Autowired
    private TransactionsService transactionsService;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private Transactionsrepo transactionsRepo;

    @PostMapping("/mpesa")
    public ResponseEntity<?> receiveMpesaTransaction(
            @RequestBody MpesaTransactionRequest request,
            @RequestHeader("X-Api-Key") String apiKey) {

        // Validate API key
        String expectedKey = System.getenv("INTERNAL_API_KEY");
        if (expectedKey == null || !expectedKey.equals(apiKey)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid API key"));
        }

        // Find user trying all phone number formats
        User user = findUserByPhone(request.getPhoneNumber());
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found for number: " + request.getPhoneNumber()));
        }

        // Duplicate check by mpesaCode
        if (request.getMpesaCode() != null && !request.getMpesaCode().isEmpty()) {
            boolean exists = transactionsRepo.existsByMpesaCodeAndUserId(
                    request.getMpesaCode(), user.getId());
            if (exists) {
                return ResponseEntity.ok(Map.of("status", "skipped", "reason", "duplicate"));
            }
        }

        // Duplicate check by raw message as fallback
        if (request.getRawSmsMessage() != null) {
            boolean exists = transactionsRepo.existsByRawMessageAndUserId(
                    request.getRawSmsMessage(), user.getId());
            if (exists) {
                return ResponseEntity.ok(Map.of("status", "skipped", "reason", "duplicate"));
            }
        }

        // Save transaction
        Transactions transaction = new Transactions();
        transaction.setUserId(user.getId());
        transaction.setRawMessage(request.getRawSmsMessage());
        transaction.setMpesaCode(request.getMpesaCode());
        transaction.setCreationDate(LocalDate.now());

        transactionsService.saveTransaction(transaction);

        return ResponseEntity.ok(Map.of("status", "received"));
    }

    private User findUserByPhone(String phone) {
        // Try as-is first e.g. 254745188124
        Optional<User> user = userRepo.findByPhoneNumber(phone);
        if (user.isPresent()) return user.get();

        // Try with leading 0 e.g. 0745188124
        if (phone.startsWith("254")) {
            user = userRepo.findByPhoneNumber("0" + phone.substring(3));
            if (user.isPresent()) return user.get();
        }

        // Try with + prefix e.g. +254745188124
        user = userRepo.findByPhoneNumber("+" + phone);
        if (user.isPresent()) return user.get();

        return null;
    }
}