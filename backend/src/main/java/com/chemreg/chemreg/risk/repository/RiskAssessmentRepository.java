package com.chemreg.chemreg.risk.repository;

import com.chemreg.chemreg.risk.entity.RiskAssessment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RiskAssessmentRepository extends JpaRepository<RiskAssessment, UUID> {
List<RiskAssessment> findByTenantId(UUID tenantId);
}
