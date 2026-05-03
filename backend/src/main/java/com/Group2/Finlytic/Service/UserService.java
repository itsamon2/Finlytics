package com.Group2.Finlytic.Service;

import com.Group2.Finlytic.Model.User;
import com.Group2.Finlytic.repo.UserRepo;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;

    public UserService(UserRepo userRepo, PasswordEncoder passwordEncoder,
                       OtpService otpService) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.otpService = otpService;
    }

    public void registerUser(User user) {
        if (userRepo.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        user.setRole("ROLE_USER");
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setEmailVerified(false);
        userRepo.save(user);

        otpService.sendOtp(user.getEmail());
    }


    public User getUserById(Long userId) {
        return userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User updateProfile(Long userId, String firstName, String lastName,
                              String phoneNumber, String profilePhoto) {
        User user = getUserById(userId);

        // Check if phone number is already taken by another user
        if (phoneNumber != null) {
            userRepo.findByPhoneNumber(phoneNumber).ifPresent(existing -> {
                if (!existing.getUserId().equals(userId)) {
                    throw new RuntimeException("Phone number already registered to another account");
                }
            });
        }

        if (firstName    != null) user.setFirstName(firstName);
        if (lastName     != null) user.setLastName(lastName);
        if (phoneNumber  != null) user.setPhoneNumber(phoneNumber);
        if (profilePhoto != null) user.setProfilePhoto(profilePhoto);
        return userRepo.save(user);
    }

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

    public void deleteAccount(Long userId) {
        userRepo.deleteById(userId);
    }
}