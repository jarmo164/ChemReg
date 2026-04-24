package com.chemreg.chemreg.user.service;

import com.chemreg.chemreg.auth.entity.UserCredential;
import com.chemreg.chemreg.auth.repository.UserCredentialRepository;
import com.chemreg.chemreg.common.enums.UserRole;
import com.chemreg.chemreg.common.enums.UserStatus;
import com.chemreg.chemreg.common.exception.BadRequestException;
import com.chemreg.chemreg.common.exception.ResourceNotFoundException;
import com.chemreg.chemreg.common.security.AuthorizationRules;
import com.chemreg.chemreg.common.security.CurrentAccessContext;
import com.chemreg.chemreg.tenant.entity.Tenant;
import com.chemreg.chemreg.tenant.repository.TenantRepository;
import com.chemreg.chemreg.user.dto.CreateUserRequest;
import com.chemreg.chemreg.user.dto.UserResponse;
import com.chemreg.chemreg.user.entity.User;
import com.chemreg.chemreg.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserCredentialRepository userCredentialRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;
    private final CurrentAccessContext currentAccessContext;
    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    public UserService(
            UserRepository userRepository,
            UserCredentialRepository userCredentialRepository,
            TenantRepository tenantRepository,
            PasswordEncoder passwordEncoder,
            CurrentAccessContext currentAccessContext
    ) {
        this.userRepository = userRepository;
        this.userCredentialRepository = userCredentialRepository;
        this.tenantRepository = tenantRepository;
        this.passwordEncoder = passwordEncoder;
        this.currentAccessContext = currentAccessContext;
    }

    @Transactional
    @PreAuthorize(AuthorizationRules.ORG_ADMIN_ONLY)
    public UserResponse createUser(CreateUserRequest request) {
        if (!currentAccessContext.currentTenantId().equals(request.getTenantId())) {
            throw new BadRequestException("Org Admin can only create users inside the authenticated tenant.");
        }

        return createUserInternal(
                request,
                request.getRole(),
                request.getStatus() == null ? UserStatus.active : request.getStatus()
        );
    }

    @Transactional
    public UserResponse registerUser(CreateUserRequest request) {
        return createUserInternal(request, UserRole.user, UserStatus.active);
    }

    private UserResponse createUserInternal(CreateUserRequest request, UserRole role, UserStatus status) {
        Tenant tenant = tenantRepository.findById(request.getTenantId())
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found: " + request.getTenantId()));

        String normalizedEmail = normalizeEmail(request.getEmail());
        if (userRepository.existsByTenantIdAndEmailIgnoreCase(tenant.getId(), normalizedEmail)) {
            throw new BadRequestException("A user with this email already exists in the tenant.");
        }

        try {
            User user = new User();
            user.setTenant(tenant);
            user.setName(request.getName().trim());
            user.setEmail(normalizedEmail);
            user.setRole(role);
            user.setStatus(status);
            user = userRepository.save(user);

            UserCredential credential = new UserCredential();
            credential.setUser(user);
            credential.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            credential.setFailedLoginAttempts(0);
            credential.setLockedUntil(null);
            credential.setLastLoginAt(null);
            credential.setEmailVerifiedAt(null);
            userCredentialRepository.save(credential);

            log.debug("User {} created with email {} .", user.getId(), user.getEmail());
            return toUserResponse(user);
        }
        catch (Exception e) {
            log.debug("User creation failed for email: {}", request.getEmail());
            throw e;
        }
    }

    private UserResponse toUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setTenantId(user.getTenant().getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setStatus(user.getStatus());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        return response;
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }
}
