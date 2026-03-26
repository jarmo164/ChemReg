package com.chemreg.chemreg.auth.service;

import com.chemreg.chemreg.auth.dto.LoginRequest;
import com.chemreg.chemreg.auth.dto.LoginResponse;
import com.chemreg.chemreg.auth.entity.UserCredential;
import com.chemreg.chemreg.auth.repository.UserCredentialRepository;
import com.chemreg.chemreg.common.enums.UserStatus;
import com.chemreg.chemreg.common.exception.UnauthorizedException;
import com.chemreg.chemreg.user.dto.UserResponse;
import com.chemreg.chemreg.user.entity.User;
import com.chemreg.chemreg.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;

@Service
public class AuthService {

    private static final int MAX_FAILED_LOGIN_ATTEMPTS = 5;
    private static final long LOCK_MINUTES = 15;

    private final UserRepository userRepository;
    private final UserCredentialRepository userCredentialRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            UserCredentialRepository userCredentialRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.userCredentialRepository = userCredentialRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByTenantIdAndEmailIgnoreCase(
                        request.getTenantId(),
                        normalizeEmail(request.getEmail()))
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password."));

        UserCredential credential = userCredentialRepository.findByUserId(user.getId())
                .orElseThrow(() -> new UnauthorizedException("Credentials not found for user."));

        if (user.getStatus() != UserStatus.active) {
            throw new UnauthorizedException("User account is not active.");
        }

        OffsetDateTime now = OffsetDateTime.now();
        if (credential.getLockedUntil() != null && credential.getLockedUntil().isAfter(now)) {
            throw new UnauthorizedException("Account is temporarily locked. Please try again later.");
        }

        if (!passwordEncoder.matches(request.getPassword(), credential.getPasswordHash())) {
            handleFailedLogin(credential, now);
            throw new UnauthorizedException("Invalid email or password.");
        }

        credential.setFailedLoginAttempts(0);
        credential.setLockedUntil(null);
        credential.setLastLoginAt(now);
        userCredentialRepository.save(credential);

        LoginResponse response = new LoginResponse();
        response.setAuthenticated(true);
        response.setMessage("Login successful.");
        response.setLoggedInAt(now);
        response.setUser(toUserResponse(user));
        return response;
    }

    private void handleFailedLogin(UserCredential credential, OffsetDateTime now) {
        int failedAttempts = credential.getFailedLoginAttempts() == null
                ? 0
                : credential.getFailedLoginAttempts();

        failedAttempts++;
        credential.setFailedLoginAttempts(failedAttempts);

        if (failedAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
            credential.setLockedUntil(now.plusMinutes(LOCK_MINUTES));
        }

        userCredentialRepository.save(credential);
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
