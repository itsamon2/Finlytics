package com.Group2.Finlytic.Controller;

import com.Group2.Finlytic.Config.JwtUtil;
import com.Group2.Finlytic.Model.User;
import com.Group2.Finlytic.Service.UserService;
import com.Group2.Finlytic.repo.UserRepo;
import org.springframework.http.ResponseEntity;
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

    public AuthController(UserService userService, UserRepo userRepo, PasswordEncoder passwordEncoder, JwtUtil jwtUtil){
        this.userService = userService;
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil         = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            userService.registerUser(user);
            return ResponseEntity.ok().body("User registered successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.status(401).body("Invalid password");
        }

        String token = jwtUtil.generateToken(email);

        return ResponseEntity.ok().body(Map.of(
                "token", token,
                "email", user.getEmail(),
                "name", user.getFirstName() + " " + user.getLastName(),
                "role", user.getRole(),
                "photo", user.getProfilePhoto() != null ? user.getProfilePhoto() : ""
        ));
    }
}