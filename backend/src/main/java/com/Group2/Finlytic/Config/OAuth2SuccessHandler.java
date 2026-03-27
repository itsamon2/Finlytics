package com.Group2.Finlytic.Config;

import com.Group2.Finlytic.Model.User;
import com.Group2.Finlytic.repo.UserRepo;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final UserRepo userRepo;

    @Value("${frontend.url:https://finlytics-steel.vercel.app}")
    private String frontendUrl;

    public OAuth2SuccessHandler(JwtUtil jwtUtil, UserRepo userRepo) {
        this.jwtUtil = jwtUtil;
        this.userRepo = userRepo;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email       = oAuth2User.getAttribute("email");
        String firstName   = oAuth2User.getAttribute("given_name");
        String lastName    = oAuth2User.getAttribute("family_name");
        String profilePhoto = oAuth2User.getAttribute("picture");

        // Auto-create user if first time logging in with Google
        Optional<User> existing = userRepo.findByEmail(email);

        if (existing.isEmpty()) {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setFirstName(firstName != null ? firstName : "");
            newUser.setLastName(lastName  != null ? lastName  : "");
            newUser.setPhoneNumber("");
            newUser.setPassword(UUID.randomUUID().toString()); // dummy password
            newUser.setRole("ROLE_USER");
            newUser.setProfilePhoto(profilePhoto);
            newUser.setProvider("GOOGLE");
            newUser.setEnabled(true);
            userRepo.save(newUser);
        } else {
            // Update profile photo every login in case it changed
            User user = existing.get();
            user.setProfilePhoto(profilePhoto);
            userRepo.save(user);
        }

        // Generate JWT and redirect to frontend with token
        String token = jwtUtil.generateToken(email);
        response.sendRedirect(frontendUrl + "/auth/callback?token=" + token);
    }
}