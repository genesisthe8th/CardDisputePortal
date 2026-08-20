package com.portal.backend.controller;

import com.portal.backend.dto.DisputeRequest;
import com.portal.backend.entity.Dispute;
import com.portal.backend.repository.DisputeRepository;
import com.portal.backend.security.CustomUserDetails;
import com.portal.backend.service.DisputeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/disputes")
public class DisputeController {

    private final DisputeService disputeService;
    private final DisputeRepository disputeRepository;

    public DisputeController(DisputeService disputeService, DisputeRepository disputeRepository) {
        this.disputeService = disputeService;
        this.disputeRepository = disputeRepository;
    }

    @GetMapping
    public ResponseEntity<List<Dispute>> getDisputes(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getUser().getId();
        List<Dispute> disputes = disputeRepository.findByUserId(userId);
        return ResponseEntity.ok(disputes);
    }

    @PostMapping
    public ResponseEntity<Dispute> submitDispute(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestHeader("Idempotency-Key") String idempotencyKey,
            @RequestBody DisputeRequest request) {
        
        Long userId = userDetails.getUser().getId();
        Dispute dispute = disputeService.submitDispute(userId, request, idempotencyKey);
        return ResponseEntity.ok(dispute);
    }

    @GetMapping("/{id}/audit")
    public ResponseEntity<List<com.portal.backend.entity.AuditLog>> getAuditLogs(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {
        
        // Verify dispute belongs to user OR user is an ADMIN
        Dispute dispute = disputeRepository.findById(id).orElseThrow();
        if (!dispute.getUser().getId().equals(userDetails.getUser().getId()) 
                && !userDetails.getUser().getRole().equals("ADMIN")) {
            return ResponseEntity.status(403).build();
        }
        
        List<com.portal.backend.entity.AuditLog> logs = disputeService.getAuditLogsForDispute(id);
        return ResponseEntity.ok(logs);
    }
}
