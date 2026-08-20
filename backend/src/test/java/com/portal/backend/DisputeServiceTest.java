package com.portal.backend;

import com.portal.backend.dto.DisputeRequest;
import com.portal.backend.entity.Dispute;
import com.portal.backend.entity.Transaction;
import com.portal.backend.entity.User;
import com.portal.backend.repository.AuditLogRepository;
import com.portal.backend.repository.DisputeRepository;
import com.portal.backend.repository.TransactionRepository;
import com.portal.backend.repository.UserRepository;
import com.portal.backend.service.DisputeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DisputeServiceTest {

    @Mock
    private DisputeRepository disputeRepository;
    @Mock
    private TransactionRepository transactionRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private DisputeService disputeService;

    private User user;
    private Transaction transaction;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");

        transaction = new Transaction();
        transaction.setId(10L);
        transaction.setUser(user);
    }

    @Test
    void testSubmitDispute_Success() {
        DisputeRequest request = new DisputeRequest();
        request.setTransactionId(10L);
        request.setReason("Fraudulent charge");

        when(disputeRepository.findByIdempotencyKey("key123")).thenReturn(Optional.empty());
        when(transactionRepository.findById(10L)).thenReturn(Optional.of(transaction));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        Dispute savedDispute = new Dispute();
        savedDispute.setId(100L);
        savedDispute.setTransaction(transaction);
        savedDispute.setUser(user);
        savedDispute.setStatus("SUBMITTED");

        when(disputeRepository.save(any(Dispute.class))).thenReturn(savedDispute);

        Dispute result = disputeService.submitDispute(1L, request, "key123");

        assertNotNull(result);
        assertEquals("SUBMITTED", result.getStatus());
        verify(auditLogRepository, times(1)).save(any());
    }

    @Test
    void testSubmitDispute_IdempotencyReturnsExisting() {
        Dispute existingDispute = new Dispute();
        existingDispute.setId(100L);
        
        when(disputeRepository.findByIdempotencyKey("key123")).thenReturn(Optional.of(existingDispute));

        DisputeRequest request = new DisputeRequest();
        Dispute result = disputeService.submitDispute(1L, request, "key123");

        assertEquals(100L, result.getId());
        verify(transactionRepository, never()).findById(anyLong());
        verify(disputeRepository, never()).save(any());
    }

    @Test
    void testSubmitDispute_TransactionNotFound() {
        DisputeRequest request = new DisputeRequest();
        request.setTransactionId(99L);

        when(disputeRepository.findByIdempotencyKey("key123")).thenReturn(Optional.empty());
        when(transactionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> {
            disputeService.submitDispute(1L, request, "key123");
        });
    }

    @Test
    void testSubmitDispute_UnauthorizedUser() {
        DisputeRequest request = new DisputeRequest();
        request.setTransactionId(10L);

        // Transaction belongs to user 1, but we submit as user 2
        when(disputeRepository.findByIdempotencyKey("key123")).thenReturn(Optional.empty());
        when(transactionRepository.findById(10L)).thenReturn(Optional.of(transaction));

        assertThrows(IllegalArgumentException.class, () -> {
            disputeService.submitDispute(2L, request, "key123");
        });
    }

    @Test
    void testUpdateDisputeStatus_Success() {
        Dispute dispute = new Dispute();
        dispute.setId(100L);
        dispute.setStatus("SUBMITTED");

        when(disputeRepository.findById(100L)).thenReturn(Optional.of(dispute));
        when(disputeRepository.save(any())).thenReturn(dispute);

        Dispute result = disputeService.updateDisputeStatus(100L, "UNDER_REVIEW", "Looking into it", 2L);

        assertEquals("UNDER_REVIEW", result.getStatus());
        verify(auditLogRepository, times(1)).save(any());
    }

    @Test
    void testUpdateDisputeStatus_NotFound() {
        when(disputeRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> {
            disputeService.updateDisputeStatus(99L, "APPROVED", null, 2L);
        });
    }
}
