package com.Group2.Finlytic.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

@Service
public class EncryptionService {

    @Value("${encryption.master-key}")
    private String masterKey;

    private static final String ALGORITHM  = "AES/GCM/NoPadding";
    private static final int    IV_LENGTH  = 12;
    private static final int    TAG_LENGTH = 128;

    // ── Derive a stable 32-byte AES key from any-length master key ──
    private byte[] getMasterKeyBytes() {
        try {
            MessageDigest sha = MessageDigest.getInstance("SHA-256");
            return sha.digest(masterKey.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            throw new RuntimeException("Failed to derive master key", e);
        }
    }

    // ── Generate a random unique 256-bit key for each user ──────────
    public String generateUserKey() {
        try {
            KeyGenerator keyGen = KeyGenerator.getInstance("AES");
            keyGen.init(256, new SecureRandom());
            SecretKey key = keyGen.generateKey();
            return Base64.getEncoder().encodeToString(key.getEncoded());
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate user key", e);
        }
    }

    // ── Encrypt user's key with master key before storing in DB ─────
    public String encryptUserKey(String rawUserKey) {
        return encryptWithKey(rawUserKey, getMasterKeyBytes());
    }

    // ── Decrypt user's key from DB using master key ──────────────────
    public String decryptUserKey(String encryptedUserKey) {
        return decryptWithKey(encryptedUserKey, getMasterKeyBytes());
    }

    // ── Encrypt SMS/message using user's unique key ──────────────────
    public String encryptMessage(String plainText, String encryptedUserKey) {
        if (plainText == null) return null;
        String rawUserKey = decryptUserKey(encryptedUserKey);
        byte[] keyBytes   = Base64.getDecoder().decode(rawUserKey);
        return encryptWithKey(plainText, keyBytes);
    }

    // ── Decrypt SMS/message using user's unique key ──────────────────
    public String decryptMessage(String encryptedText, String encryptedUserKey) {
        if (encryptedText == null) return null;
        String rawUserKey = decryptUserKey(encryptedUserKey);
        byte[] keyBytes   = Base64.getDecoder().decode(rawUserKey);
        return decryptWithKey(encryptedText, keyBytes);
    }

    // ── Core encrypt (AES-256-GCM) ───────────────────────────────────
    private String encryptWithKey(String plainText, byte[] keyBytes) {
        try {
            byte[] iv = new byte[IV_LENGTH];
            new SecureRandom().nextBytes(iv);

            Cipher    cipher    = Cipher.getInstance(ALGORITHM);
            SecretKey secretKey = new SecretKeySpec(keyBytes, "AES");
            cipher.init(Cipher.ENCRYPT_MODE, secretKey,
                    new GCMParameterSpec(TAG_LENGTH, iv));

            byte[] encrypted = cipher.doFinal(
                    plainText.getBytes(StandardCharsets.UTF_8));

            byte[] combined = new byte[IV_LENGTH + encrypted.length];
            System.arraycopy(iv,        0, combined, 0,         IV_LENGTH);
            System.arraycopy(encrypted, 0, combined, IV_LENGTH, encrypted.length);

            return Base64.getEncoder().encodeToString(combined);
        } catch (Exception e) {
            throw new RuntimeException("Encryption failed", e);
        }
    }

    // ── Core decrypt (AES-256-GCM) ───────────────────────────────────
    private String decryptWithKey(String encryptedText, byte[] keyBytes) {
        try {
            byte[] combined  = Base64.getDecoder().decode(encryptedText);
            byte[] iv        = new byte[IV_LENGTH];
            byte[] encrypted = new byte[combined.length - IV_LENGTH];
            System.arraycopy(combined, 0,         iv,        0, IV_LENGTH);
            System.arraycopy(combined, IV_LENGTH, encrypted, 0, encrypted.length);

            Cipher    cipher    = Cipher.getInstance(ALGORITHM);
            SecretKey secretKey = new SecretKeySpec(keyBytes, "AES");
            cipher.init(Cipher.DECRYPT_MODE, secretKey,
                    new GCMParameterSpec(TAG_LENGTH, iv));

            return new String(cipher.doFinal(encrypted), StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Decryption failed", e);
        }
    }
}