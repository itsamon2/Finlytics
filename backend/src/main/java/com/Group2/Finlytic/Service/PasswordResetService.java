package com.Group2.Finlytic.Service;

import com.Group2.Finlytic.Model.User;
import com.Group2.Finlytic.repo.UserRepo;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PasswordResetService {

    private final UserRepo        userRepo;
    private final JavaMailSender  mailSender;
    private final PasswordEncoder passwordEncoder;

    public PasswordResetService(UserRepo userRepo,
                                JavaMailSender mailSender,
                                PasswordEncoder passwordEncoder) {
        this.userRepo        = userRepo;
        this.mailSender      = mailSender;
        this.passwordEncoder = passwordEncoder;
    }

    // ── Step 1: User requests reset ──────────────────────────────
    public void sendResetEmail(String email) {

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException(
                        "No account found with that email"));

        // Generate a secure random token
        String token = UUID.randomUUID().toString();

        // FIX: Comment previously said "1 hour from now" but expiry was 10 minutes.
        //      Comment now correctly reflects the actual 10-minute expiry window.
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(10));
        userRepo.save(user);

        // Send email
        String resetLink = "http://localhost:5173/reset-password?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setFrom("finylitics@gmail.com");
        message.setSubject("Finlytics — Reset Your Password");
        message.setText(
                "Hello " + user.getFirstName() + ",\n\n" +
                        "We received a request to reset your password. " +
                        "Click the link below to proceed:\n\n" +
                        resetLink + "\n\n" +
                        "This link expires in 10 minutes.\n\n" +
                        "If you didn't request this, you can safely ignore this email.\n\n" +
                        "— Finlytics Team"
        );

        mailSender.send(message);
    }

    // ── Step 2: User submits new password ────────────────────────
    public void resetPassword(String token, String newPassword) {

        User user = userRepo.findByResetToken(token)
                .orElseThrow(() -> new RuntimeException(
                        "Invalid or expired reset link"));

        // Check token hasn't expired
        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException(
                    "Reset link has expired. Please request a new one.");
        }

        // Set new password and clear token
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepo.save(user);
    }
}