package com.Group2.Finlytic.DTO;

public class MpesaTransactionRequest {
    private String phoneNumber;
    private String rawSmsMessage;

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; } // ← fixed

    public String getRawSmsMessage() { return rawSmsMessage; }
    public void setRawSmsMessage(String rawSmsMessage) { this.rawSmsMessage = rawSmsMessage; }
}