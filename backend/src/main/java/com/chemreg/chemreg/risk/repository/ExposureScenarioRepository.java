package com.chemreg.chemreg.risk.repository;

import com.chemreg.chemreg.risk.entity.ExposureScenario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ExposureScenarioRepository extends JpaRepository<ExposureScenario, UUID> {
List<ExposureScenario> findByAssessmentId(UUID assessmentId);
}
