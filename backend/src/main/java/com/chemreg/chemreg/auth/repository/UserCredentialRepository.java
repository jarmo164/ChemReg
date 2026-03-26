package com.chemreg.chemreg.auth.repository;

import com.chemreg.chemreg.auth.entity.UserCredential;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserCredentialRepository extends JpaRepository<UserCredential, UUID> {
Optional<UserCredential> findByUserId(UUID userId);
}
