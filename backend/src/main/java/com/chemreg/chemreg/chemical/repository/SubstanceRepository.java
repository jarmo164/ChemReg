package com.chemreg.chemreg.chemical.repository;

import com.chemreg.chemreg.chemical.entity.Substance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SubstanceRepository extends JpaRepository<Substance, UUID> {
List<Substance> findByTenantId(UUID tenantId);
}
