package com.chemreg.chemreg.risk.repository;

import com.chemreg.chemreg.risk.entity.RiskAssessmentTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RiskAssessmentTemplateRepository extends JpaRepository<RiskAssessmentTemplate, UUID> {
List<RiskAssessmentTemplate> findByTenantId(UUID tenantId);
}
