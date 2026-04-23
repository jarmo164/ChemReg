package com.chemreg.chemreg.user.service;

import com.chemreg.chemreg.auth.repository.UserCredentialRepository;
import com.chemreg.chemreg.common.enums.UserRole;
import com.chemreg.chemreg.common.exception.BadRequestException;
import com.chemreg.chemreg.common.security.CurrentAccessContext;
import com.chemreg.chemreg.tenant.repository.TenantRepository;
import com.chemreg.chemreg.user.dto.CreateUserRequest;
import com.chemreg.chemreg.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private UserCredentialRepository userCredentialRepository;
    @Mock
    private TenantRepository tenantRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private CurrentAccessContext currentAccessContext;

    private UserService userService;

    @BeforeEach
    void setUp() {
        userService = new UserService(
                userRepository,
                userCredentialRepository,
                tenantRepository,
                passwordEncoder,
                currentAccessContext
        );
    }

    @Test
    void createUserRejectsCrossTenantWriteAttempt() {
        UUID authenticatedTenantId = UUID.randomUUID();
        UUID requestedTenantId = UUID.randomUUID();
        when(currentAccessContext.currentTenantId()).thenReturn(authenticatedTenantId);

        CreateUserRequest request = new CreateUserRequest();
        request.setTenantId(requestedTenantId);
        request.setName("Tenant Escape Attempt");
        request.setEmail("escape@example.com");
        request.setPassword("password123");
        request.setRole(UserRole.user);

        assertThrows(BadRequestException.class, () -> userService.createUser(request));

        verifyNoInteractions(tenantRepository, userRepository, userCredentialRepository, passwordEncoder);
    }
}
