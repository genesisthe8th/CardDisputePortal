package com.portal.backend.dto;

public class ReviewDisputeRequest {
    private String status; // "UNDER_REVIEW", "APPROVED", "REJECTED"
    private String reviewNotes;

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getReviewNotes() { return reviewNotes; }
    public void setReviewNotes(String reviewNotes) { this.reviewNotes = reviewNotes; }
}
