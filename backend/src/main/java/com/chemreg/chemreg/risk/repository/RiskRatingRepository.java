package com.chemreg.chemreg.risk.repository;

import com.chemreg.chemreg.risk.entity.RiskRating;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RiskRatingRepository extends JpaRepository<RiskRating, UUID> {
List<RiskRating> findByAssessmentId(UUID assessmentId);
}
