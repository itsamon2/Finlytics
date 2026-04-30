package com.Group2.Finlytic.Service;

import com.Group2.Finlytic.Model.emailOtp;
import com.Group2.Finlytic.Model.User;
import com.Group2.Finlytic.repo.EmailRepo;
import com.Group2.Finlytic.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class OtpService {

    @Autowired
    private EmailRepo otpRepo;

    @Autowired
    private UserRepo userRepository;

    @Autowired
    private EmailService emailService;

    private String generateOtp() {

        return String.valueOf(new Random().nextInt(900000) + 100000);
    }


    @Transactional
    public void sendOtp(String email) {

        otpRepo.deleteByEmail(email);

        String otp = generateOtp();

        emailOtp emailOtp = new emailOtp();
        emailOtp.setEmail(email);
        emailOtp.setOtp(otp);
        emailOtp.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        emailOtp.setVerified(false);

        otpRepo.save(emailOtp);
        emailService.sendOtpEmail(email, otp);
    }

    //user submits otp
    @Transactional
    public String verifyOtp(String email, String otp) {
        Optional<emailOtp> record = otpRepo
                .findByEmailAndOtpAndVerifiedFalse(email, otp);

        if (record.isEmpty()) {
            return "INVALID";
        }

        emailOtp emailOtp = record.get();

        if (emailOtp.getExpiresAt().isBefore(LocalDateTime.now())) {
            otpRepo.delete(emailOtp);
            return "EXPIRED";
        }


        emailOtp.setVerified(true);
        otpRepo.save(emailOtp);

        // Mark user as email-verified
        Optional<User> userOpt = userRepository.findByEmail(email);
        userOpt.ifPresent(user -> {
            user.setEmailVerified(true);
            userRepository.save(user);
        });

        return "SUCCESS";
    }
}