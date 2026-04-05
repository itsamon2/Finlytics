package com.Group2.Finlytic.Controller;

import com.Group2.Finlytic.Model.User;
import com.Group2.Finlytic.Service.CustomUserDetails;
import com.Group2.Finlytic.Service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // ── Get current user profile ──────────────────────────────────────────────
    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userService.getUserById(userDetails.getUserId());
        return ResponseEntity.ok(Map.of(
                "userId",       user.getUserId(),
                "firstName",    user.getFirstName(),
                "lastName",     user.getLastName(),
                "email",        user.getEmail(),
                "phoneNumber",  user.getPhoneNumber() != null ? user.getPhoneNumber() : "",
                "profilePhoto", user.getProfilePhoto() != null ? user.getProfilePhoto() : ""
        ));
    }

    // ── Update profile ────────────────────────────────────────────────────────
    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, String> body) {
        User updated = userService.updateProfile(
                userDetails.getUserId(),
                body.get("firstName"),
                body.get("lastName"),
                body.get("phoneNumber"),
                body.get("profilePhoto")
        );
        return ResponseEntity.ok(Map.of(
                "userId",       updated.getUserId(),
                "firstName",    updated.getFirstName(),
                "lastName",     updated.getLastName(),
                "email",        updated.getEmail(),
                "phoneNumber",  updated.getPhoneNumber() != null ? updated.getPhoneNumber() : "",
                "profilePhoto", updated.getProfilePhoto() != null ? updated.getProfilePhoto() : ""
        ));
    }

    // ── Change password ───────────────────────────────────────────────────────
    @PutMapping("/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, String> body) {
        try {
            userService.changePassword(
                    userDetails.getUserId(),
                    body.get("currentPassword"),
                    body.get("newPassword")
            );
            return ResponseEntity.ok(Map.of("success", true, "message", "Password changed successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // ── Delete account ────────────────────────────────────────────────────────
    @DeleteMapping("/account")
    public ResponseEntity<Map<String, Object>> deleteAccount(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        userService.deleteAccount(userDetails.getUserId());
        return ResponseEntity.ok(Map.of("success", true, "message", "Account deleted successfully"));
    }
}