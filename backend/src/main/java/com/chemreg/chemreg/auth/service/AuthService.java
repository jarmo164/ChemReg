package com.chemreg.chemreg.auth.service;
import com.chemreg.chemreg.auth.dto.LoginRequest;
import com.chemreg.chemreg.auth.dto.LoginResponse;
import com.chemreg.chemreg.auth.dto.TokenRefreshResponse;
import com.chemreg.chemreg.auth.entity.RefreshToken;
import com.chemreg.chemreg.auth.entity.UserCredential;
import com.chemreg.chemreg.common.enums.UserStatus;
import com.chemreg.chemreg.common.exception.UnauthorizedException;
import com.chemreg.chemreg.user.dto.UserResponse;
import com.chemreg.chemreg.user.entity.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.chemreg.chemreg.user.repository.UserRepository;
import com.chemreg.chemreg.auth.repository.UserCredentialRepository;
import java.time.OffsetDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private static final int MAX_FAILED_LOGIN_ATTEMPTS = 5;
    private static final long LOCK_MINUTES = 15;

    private final UserRepository userRepository;
    private final UserCredentialRepository userCredentialRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    public AuthService(
            UserRepository userRepository,
            UserCredentialRepository userCredentialRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            RefreshTokenService refreshTokenService
    ) {
        this.userRepository = userRepository;
        this.userCredentialRepository = userCredentialRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
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

        JwtService.IssuedAccessToken accessToken = jwtService.createAccessToken(user);
        String refreshToken = refreshTokenService.issue(user.getId());

        LoginResponse response = new LoginResponse();
        response.setAuthenticated(true);
        response.setMessage("Login successful.");
        response.setLoggedInAt(now);
        response.setAccessToken(accessToken.token());
        response.setRefreshToken(refreshToken);
        response.setTokenType("Bearer");
        response.setAccessTokenExpiresAt(accessToken.expiresAt());
        response.setUser(toUserResponse(user));

        log.debug("User {} login successful!", user.getId());
        return response;
    }

    @Transactional
    public TokenRefreshResponse refresh(String rawRefreshToken) {
        RefreshToken storedRefreshToken = refreshTokenService.requireActive(rawRefreshToken);

        User user = userRepository.findById(storedRefreshToken.getUserId())
                .orElseThrow(() -> new UnauthorizedException("User not found."));

        if (user.getStatus() != UserStatus.active) {
            refreshTokenService.revoke(rawRefreshToken);
            throw new UnauthorizedException("User account is not active.");
        }

        refreshTokenService.revoke(rawRefreshToken);
        String newRefreshToken = refreshTokenService.issue(user.getId());
        JwtService.IssuedAccessToken newAccessToken = jwtService.createAccessToken(user);

        log.debug("Refreshed token - refreshToken: {} , new accessToken: {}", rawRefreshToken, newAccessToken.token());
        return new TokenRefreshResponse(
                newAccessToken.token(),
                newRefreshToken,
                "Bearer",
                newAccessToken.expiresAt()
        );
    }

    @Transactional
    public void logout(UUID userId, String rawRefreshToken) {
        refreshTokenService.revokeForUser(userId, rawRefreshToken);
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