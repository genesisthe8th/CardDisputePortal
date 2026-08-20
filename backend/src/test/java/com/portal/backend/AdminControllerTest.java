package com.portal.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.portal.backend.controller.AdminController;
import com.portal.backend.dto.ReviewDisputeRequest;
import com.portal.backend.entity.Dispute;
import com.portal.backend.entity.User;
import com.portal.backend.security.CustomUserDetails;
import com.portal.backend.service.DisputeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
public class AdminControllerTest {

    private MockMvc mockMvc;

    @Mock
    private DisputeService disputeService;

    @InjectMocks
    private AdminController adminController;

    private ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(adminController)
                .setCustomArgumentResolvers(new org.springframework.web.method.support.HandlerMethodArgumentResolver() {
                    @Override
                    public boolean supportsParameter(org.springframework.core.MethodParameter parameter) {
                        return parameter.getParameterType().isAssignableFrom(CustomUserDetails.class);
                    }
                    @Override
                    public Object resolveArgument(org.springframework.core.MethodParameter parameter, org.springframework.web.method.support.ModelAndViewContainer mavContainer, org.springframework.web.context.request.NativeWebRequest webRequest, org.springframework.web.bind.support.WebDataBinderFactory binderFactory) {
                        User adminUser = new User();
                        adminUser.setId(2L);
                        return new CustomUserDetails(adminUser);
                    }
                })
                .build();
    }

    @Test
    void testGetAllDisputes_AllowedForAdmin() throws Exception {
        Dispute dispute = new Dispute();
        dispute.setId(10L);
        dispute.setStatus("SUBMITTED");

        when(disputeService.getAllDisputes()).thenReturn(Collections.singletonList(dispute));

        mockMvc.perform(get("/api/admin/disputes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(10))
                .andExpect(jsonPath("$[0].status").value("SUBMITTED"));
    }

    @Test
    void testReviewDispute_AllowedForAdmin() throws Exception {
        User adminUser = new User();
        adminUser.setId(2L);
        adminUser.setEmail("admin@example.com");
        adminUser.setRole("ADMIN");
        
        CustomUserDetails adminDetails = new CustomUserDetails(adminUser);

        ReviewDisputeRequest request = new ReviewDisputeRequest();
        request.setStatus("APPROVED");
        request.setReviewNotes("Looks good");

        Dispute dispute = new Dispute();
        dispute.setId(10L);
        dispute.setStatus("APPROVED");

        when(disputeService.updateDisputeStatus(eq(10L), eq("APPROVED"), eq("Looks good"), eq(2L)))
                .thenReturn(dispute);

        org.springframework.http.ResponseEntity<Dispute> response = adminController.reviewDispute(adminDetails, 10L, request);
        
        org.junit.jupiter.api.Assertions.assertEquals(org.springframework.http.HttpStatus.OK, response.getStatusCode());
        org.junit.jupiter.api.Assertions.assertEquals("APPROVED", response.getBody().getStatus());
    }
}
