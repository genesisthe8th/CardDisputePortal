package com.portal.backend.dto;

public class DisputeRequest {
    private Long transactionId;
    private String reason;

    // Getters and setters
    public Long getTransactionId() { return transactionId; }
    public void setTransactionId(Long transactionId) { this.transactionId = transactionId; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
