package com.chemreg.chemreg.incident.repository;

import com.chemreg.chemreg.incident.entity.Incident;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IncidentRepository extends JpaRepository<Incident, UUID> {
List<Incident> findByTenantId(UUID tenantId);
}
