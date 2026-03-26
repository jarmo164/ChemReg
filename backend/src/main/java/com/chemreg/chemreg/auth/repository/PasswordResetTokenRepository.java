package com.chemreg.chemreg.auth.repository;

import com.chemreg.chemreg.auth.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {
Optional<PasswordResetToken> findByTokenHash(String tokenHash);
}
