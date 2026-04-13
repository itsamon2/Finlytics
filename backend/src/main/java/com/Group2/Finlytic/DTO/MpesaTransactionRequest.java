package com.Group2.Finlytic.DTO;

public class MpesaTransactionRequest {
    private String phoneNumber;
    private String rawSmsMessage;
    private String mpesaCode; // ← ADDED

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getRawSmsMessage() { return rawSmsMessage; }
    public void setRawSmsMessage(String rawSmsMessage) { this.rawSmsMessage = rawSmsMessage; }

    public String getMpesaCode() { return mpesaCode; } // ← ADDED
    public void setMpesaCode(String mpesaCode) { this.mpesaCode = mpesaCode; } // ← ADDED
}