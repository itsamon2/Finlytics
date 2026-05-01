package com.Group2.Finlytic.Controller;

import com.Group2.Finlytic.Config.JwtUtil;
import com.Group2.Finlytic.Model.User;
import com.Group2.Finlytic.Service.CustomUserDetails;
import com.Group2.Finlytic.Service.OtpService;
import com.Group2.Finlytic.Service.UserService;
import com.Group2.Finlytic.repo.UserRepo;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final OtpService otpService;

    public AuthController(UserService userService,
                          UserRepo userRepo,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil,
                          OtpService otpService) {
        this.userService = userService;
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.otpService = otpService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        try {
            String fullName = request.getOrDefault("name", "").trim();
            int spaceIndex = fullName.indexOf(' ');
            String firstName = spaceIndex > 0 ? fullName.substring(0, spaceIndex) : fullName;
            String lastName  = spaceIndex > 0 ? fullName.substring(spaceIndex + 1) : "";

            User user = new User();
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setEmail(request.get("email"));
            user.setPassword(request.get("password"));
            user.setPhoneNumber(request.getOrDefault("phone", ""));
            user.setRole("ROLE_USER");
            user.setProvider("LOCAL");
            user.setEnabled(true);

            userService.registerUser(user);

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "Registration successful! Please check your email for the OTP.",
                    "email", user.getEmail()
            ));

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email    = request.get("email");
        String password = request.get("password");

        User user = userRepo.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid email or password"));
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid email or password"));
        }

        if (!user.isEmailVerified()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "message", "Email not verified. Please check your email for the OTP.",
                    "email", user.getEmail() // send email so frontend can redirect to OTP page
            ));
        }

        String token = jwtUtil.generateToken(email);

        return ResponseEntity.ok(Map.of(
                "token", token,
                "email", user.getEmail(),
                "name",  user.getFirstName() + " " + user.getLastName(),
                "role",  user.getRole(),
                "photo", user.getProfilePhoto() != null ? user.getProfilePhoto() : ""
        ));
    }

    // ── POST /api/auth/verify-otp
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String email  = request.get("email");
        String otp    = request.get("otp");

        String result = otpService.verifyOtp(email, otp);

        return switch (result) {
            case "SUCCESS" -> {
                // ✅ Issue token NOW — after email is verified
                User user  = userRepo.findByEmail(email).orElseThrow();
                String token = jwtUtil.generateToken(email);
                yield ResponseEntity.ok(Map.of(
                        "message", "Email verified successfully!",
                        "token",   token,
                        "email",   user.getEmail(),
                        "name",    user.getFirstName() + " " + user.getLastName(),
                        "role",    user.getRole(),
                        "photo",   user.getProfilePhoto() != null ? user.getProfilePhoto() : ""
                ));
            }
            case "EXPIRED" -> ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "OTP has expired. Please request a new one."));
            default -> ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid OTP. Please try again."));
        };
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        User user = userRepo.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Email not found"));
        }
        if (user.isEmailVerified()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Email is already verified"));
        }

        otpService.sendOtp(email);
        return ResponseEntity.ok(Map.of("message", "OTP resent to " + email));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Unauthorized"));
        }

        User user = userRepo.findByEmail(userDetails.getUsername()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }

        return ResponseEntity.ok(Map.of(
                "email", user.getEmail(),
                "name",  user.getFirstName() + " " + user.getLastName(),
                "role",  user.getRole(),
                "photo", user.getProfilePhoto() != null ? user.getProfilePhoto() : ""
        ));
    }
}