package com.portal.backend.service;

import com.portal.backend.dto.DisputeRequest;
import com.portal.backend.entity.AuditLog;
import com.portal.backend.entity.Dispute;
import com.portal.backend.entity.Transaction;
import com.portal.backend.entity.User;
import com.portal.backend.repository.AuditLogRepository;
import com.portal.backend.repository.DisputeRepository;
import com.portal.backend.repository.TransactionRepository;
import com.portal.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class DisputeService {

    private final DisputeRepository disputeRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;

    public DisputeService(DisputeRepository disputeRepository,
                          TransactionRepository transactionRepository,
                          UserRepository userRepository,
                          AuditLogRepository auditLogRepository) {
        this.disputeRepository = disputeRepository;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public Dispute submitDispute(Long userId, DisputeRequest request, String idempotencyKey) {
        Optional<Dispute> existingDispute = disputeRepository.findByIdempotencyKey(idempotencyKey);
        if (existingDispute.isPresent()) {
            return existingDispute.get();
        }

        Transaction transaction = transactionRepository.findById(request.getTransactionId())
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found"));

        if (!transaction.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized to dispute this transaction");
        }

        User user = userRepository.findById(userId).orElseThrow();

        Dispute dispute = new Dispute();
        dispute.setTransaction(transaction);
        dispute.setUser(user);
        dispute.setStatus("SUBMITTED");
        dispute.setReason(request.getReason());
        dispute.setIdempotencyKey(idempotencyKey);

        Dispute savedDispute = disputeRepository.save(dispute);

        AuditLog auditLog = new AuditLog();
        auditLog.setEntityType("DISPUTE");
        auditLog.setEntityId(savedDispute.getId());
        auditLog.setNewState("STATUS: SUBMITTED, REASON: " + request.getReason());
        auditLog.setChangedBy(userId);
        auditLog.setTimestamp(LocalDateTime.now());
        auditLogRepository.save(auditLog);

        return savedDispute;
    }

    public java.util.List<AuditLog> getAuditLogsForDispute(Long disputeId) {
        return auditLogRepository.findByEntityTypeAndEntityIdOrderByTimestampDesc("DISPUTE", disputeId);
    }

    @Transactional
    public Dispute updateDisputeStatus(Long disputeId, String newStatus, String notes, Long reviewerId) {
        Dispute dispute = disputeRepository.findById(disputeId)
                .orElseThrow(() -> new IllegalArgumentException("Dispute not found"));

        String previousState = "STATUS: " + dispute.getStatus();
        dispute.setStatus(newStatus);
        Dispute updatedDispute = disputeRepository.save(dispute);

        AuditLog auditLog = new AuditLog();
        auditLog.setEntityType("DISPUTE");
        auditLog.setEntityId(dispute.getId());
        auditLog.setPreviousState(previousState);
        auditLog.setNewState("STATUS: " + newStatus + (notes != null ? ", NOTES: " + notes : ""));
        auditLog.setChangedBy(reviewerId);
        auditLog.setTimestamp(LocalDateTime.now());
        auditLogRepository.save(auditLog);

        return updatedDispute;
    }

    public java.util.List<Dispute> getAllDisputes() {
        return disputeRepository.findAll();
    }
}
