package com.portal.backend;

import com.portal.backend.entity.User;
import com.portal.backend.security.CustomUserDetails;
import com.portal.backend.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class JwtServiceTest {

    private JwtService jwtService;
    private CustomUserDetails userDetails;
    private User user;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");
        user.setRole("USER");
        userDetails = new CustomUserDetails(user);
    }

    @Test
    void testGenerateAndExtractToken() {
        String token = jwtService.generateToken(userDetails, user.getId(), user.getRole());
        assertNotNull(token);

        String extractedUsername = jwtService.extractUsername(token);
        assertEquals("test@example.com", extractedUsername);

        Long extractedUserId = jwtService.extractUserId(token);
        assertEquals(1L, extractedUserId);
        
        String extractedRole = jwtService.extractClaim(token, claims -> claims.get("role", String.class));
        assertEquals("USER", extractedRole);
    }

    @Test
    void testIsTokenValid() {
        String token = jwtService.generateToken(userDetails, user.getId(), user.getRole());
        assertTrue(jwtService.isTokenValid(token, userDetails));

        User wrongUser = new User();
        wrongUser.setEmail("wrong@example.com");
        CustomUserDetails wrongUserDetails = new CustomUserDetails(wrongUser);

        assertFalse(jwtService.isTokenValid(token, wrongUserDetails));
    }
}
