package com.Group2.Finlytic.Controller;

import com.Group2.Finlytic.Config.JwtUtil;
import com.Group2.Finlytic.Model.User;
import com.Group2.Finlytic.Service.UserService;
import com.Group2.Finlytic.repo.UserRepo;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService     userService;
    private final UserRepo        userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil         jwtUtil;

    public AuthController(UserService userService,
                          UserRepo userRepo,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil) {
        this.userService     = userService;
        this.userRepo        = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil         = jwtUtil;
    }

    // ── POST /api/auth/register ──────────────────────────────────────────────
    // Frontend sends: { name, email, password, phone, location }
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        try {
            String fullName   = request.getOrDefault("name", "").trim();
            int    spaceIndex = fullName.indexOf(' ');
            String firstName  = spaceIndex > 0 ? fullName.substring(0, spaceIndex) : fullName;
            String lastName   = spaceIndex > 0 ? fullName.substring(spaceIndex + 1) : "";

            User user = new User();
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setEmail(request.get("email"));
            user.setPassword(request.get("password"));       // UserService will encode it
            user.setPhoneNumber(request.getOrDefault("phone", ""));
            user.setRole("ROLE_USER");
            user.setProvider("LOCAL");
            user.setEnabled(true);

            userService.registerUser(user);                  // existing logic, unchanged

            // Issue token immediately so frontend logs straight in
            String token = jwtUtil.generateToken(user.getEmail());

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "token", token,
                    "email", user.getEmail(),
                    "name",  user.getFirstName() + " " + user.getLastName(),
                    "role",  user.getRole(),
                    "photo", ""
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── POST /api/auth/login ─────────────────────────────────────────────────
    // Unchanged from your original — just wraps error in Map so frontend can read it
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

        String token = jwtUtil.generateToken(email);

        return ResponseEntity.ok(Map.of(
                "token", token,
                "email", user.getEmail(),
                "name",  user.getFirstName() + " " + user.getLastName(),
                "role",  user.getRole(),
                "photo", user.getProfilePhoto() != null ? user.getProfilePhoto() : ""
        ));
    }

    // ── GET /api/auth/me ─────────────────────────────────────────────────────
    // Called by OAuthCallback.jsx after Google login to fetch user profile
    @GetMapping("/me")
    public ResponseEntity<?> getMe(@AuthenticationPrincipal UserDetails userDetails) {
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