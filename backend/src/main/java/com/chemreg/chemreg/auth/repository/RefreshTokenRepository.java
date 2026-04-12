package com.chemreg.chemreg.auth.repository;

import com.chemreg.chemreg.auth.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByTokenHashAndRevokedAtIsNull(String tokenHash);
    Optional<RefreshToken> findByUserIdAndTokenHashAndRevokedAtIsNull(UUID userId, String tokenHash);
}