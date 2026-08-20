package com.portal.backend.controller;

import com.portal.backend.dto.ReviewDisputeRequest;
import com.portal.backend.entity.Dispute;
import com.portal.backend.security.CustomUserDetails;
import com.portal.backend.service.DisputeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/disputes")
public class AdminController {

    private final DisputeService disputeService;

    public AdminController(DisputeService disputeService) {
        this.disputeService = disputeService;
    }

    @GetMapping
    public ResponseEntity<List<Dispute>> getAllDisputes() {
        return ResponseEntity.ok(disputeService.getAllDisputes());
    }

    @PatchMapping("/{id}/review")
    public ResponseEntity<Dispute> reviewDispute(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @RequestBody ReviewDisputeRequest request) {

        Long reviewerId = userDetails.getUser().getId();
        Dispute updated = disputeService.updateDisputeStatus(id, request.getStatus(), request.getReviewNotes(), reviewerId);
        return ResponseEntity.ok(updated);
    }
}
