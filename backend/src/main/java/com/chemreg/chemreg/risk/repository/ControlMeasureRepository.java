package com.chemreg.chemreg.risk.repository;

import com.chemreg.chemreg.risk.entity.ControlMeasure;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ControlMeasureRepository extends JpaRepository<ControlMeasure, UUID> {
List<ControlMeasure> findByScenarioId(UUID scenarioId);
}
