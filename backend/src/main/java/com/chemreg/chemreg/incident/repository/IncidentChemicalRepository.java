package com.chemreg.chemreg.incident.repository;

import com.chemreg.chemreg.incident.entity.IncidentChemical;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IncidentChemicalRepository extends JpaRepository<IncidentChemical, UUID> {
List<IncidentChemical> findByIncidentId(UUID incidentId);
}
