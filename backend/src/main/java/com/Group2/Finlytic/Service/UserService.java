package com.Group2.Finlytic.Service;

import com.Group2.Finlytic.Model.User;
import com.Group2.Finlytic.repo.UserRepo;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepo userRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    // ── Existing ─────────────────────────────────────────────────────────────
    public void registerUser(User user) {
        if (userRepo.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }
        user.setRole("ROLE_USER");
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepo.save(user);
    }

    // ── New ───────────────────────────────────────────────────────────────────

    // Get user by ID
    public User getUserById(Long userId) {
        return userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // Update profile — firstName, lastName, phoneNumber, profilePhoto
    public User updateProfile(Long userId, String firstName, String lastName,
                              String phoneNumber, String profilePhoto) {
        User user = getUserById(userId);
        if (firstName   != null) user.setFirstName(firstName);
        if (lastName    != null) user.setLastName(lastName);
        if (phoneNumber != null) user.setPhoneNumber(phoneNumber);
        if (profilePhoto != null) user.setProfilePhoto(profilePhoto);
        return userRepo.save(user);
    }

    // Change password — verifies current password before updating
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        User user = getUserById(userId);

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        if (newPassword.length() < 8) {
            throw new RuntimeException("New password must be at least 8 characters");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepo.save(user);
    }

    // Delete account
    public void deleteAccount(Long userId) {
        userRepo.deleteById(userId);
    }
}