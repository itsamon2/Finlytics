package com.Group2.Finlytic.repo;

import com.Group2.Finlytic.Model.emailOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface EmailRepo extends JpaRepository<emailOtp, Long> {
    Optional<emailOtp> findByEmailAndOtpAndVerifiedFalse(String email, String otp);
    void deleteByEmail(String email);
}