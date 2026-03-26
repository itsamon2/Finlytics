package com.Group2.Finlytic.Service;

import com.Group2.Finlytic.Model.User;
import com.Group2.Finlytic.repo.UserRepo;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepo userRepo, PasswordEncoder passwordEncoder){
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    public void registerUser(User user) {

        if(userRepo.findByEmail(user.getEmail()).isPresent()){
            throw new RuntimeException("Email already registered");
        }
        user.setRole("ROLE_USER");
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepo.save(user);
    }
}