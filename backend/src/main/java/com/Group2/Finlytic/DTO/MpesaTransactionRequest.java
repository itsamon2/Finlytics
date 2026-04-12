package com.Group2.Finlytic.DTO;

public class MpesaTransactionRequest {
    private String phoneNumber;
    private String rawSmsMessage;

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String mobileNumber) { this.phoneNumber = phoneNumber; }

    public String getRawSmsMessage() { return rawSmsMessage; }
    public void setRawSmsMessage(String rawSmsMessage) { this.rawSmsMessage = rawSmsMessage; }
}