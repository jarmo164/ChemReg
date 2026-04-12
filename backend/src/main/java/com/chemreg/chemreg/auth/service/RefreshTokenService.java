package com.chemreg.chemreg.auth.service;

import com.chemreg.chemreg.auth.entity.RefreshToken;
import com.chemreg.chemreg.auth.repository.RefreshTokenRepository;
import com.chemreg.chemreg.common.exception.UnauthorizedException;
import com.chemreg.chemreg.common.config.JwtProperties;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtProperties jwtProperties;
    private final SecureRandom secureRandom = new SecureRandom();

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository, JwtProperties jwtProperties) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtProperties = jwtProperties;
    }

    public String issue(UUID userId) {
        String rawToken = generateSecureToken();

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUserId(userId);
        refreshToken.setTokenHash(hash(rawToken));
        refreshToken.setCreatedAt(OffsetDateTime.now());
        refreshToken.setExpiresAt(OffsetDateTime.now().plusDays(jwtProperties.refreshTokenDays()));
        refreshToken.setRevokedAt(null);

        refreshTokenRepository.save(refreshToken);
        return rawToken;
    }

    public RefreshToken requireActive(String rawToken) {
        RefreshToken stored = refreshTokenRepository.findByTokenHashAndRevokedAtIsNull(hash(rawToken))
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token."));

        if (stored.getExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new UnauthorizedException("Refresh token expired.");
        }

        return stored;
    }

    public void revoke(String rawToken) {
        refreshTokenRepository
                .findByTokenHashAndRevokedAtIsNull(hash(rawToken))
                .ifPresent(token -> {
                    token.setRevokedAt(OffsetDateTime.now());
                    refreshTokenRepository.save(token);
                });
    }

    public void revokeForUser(UUID userId, String rawToken) {
        refreshTokenRepository.findByUserIdAndTokenHashAndRevokedAtIsNull(userId, hash(rawToken))
                .ifPresent(token -> {
                    token.setRevokedAt(OffsetDateTime.now());
                    refreshTokenRepository.save(token);
                });
    }

    private String generateSecureToken() {
        byte[] bytes = new byte[64];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hash(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashed);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm not available", e);
        }
    }
}