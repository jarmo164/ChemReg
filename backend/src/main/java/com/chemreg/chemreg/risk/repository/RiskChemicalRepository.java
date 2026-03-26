package com.chemreg.chemreg.risk.repository;

import com.chemreg.chemreg.risk.entity.RiskChemical;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RiskChemicalRepository extends JpaRepository<RiskChemical, UUID> {
List<RiskChemical> findByAssessmentId(UUID assessmentId);
}
