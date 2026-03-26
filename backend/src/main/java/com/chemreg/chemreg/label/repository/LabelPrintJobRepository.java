package com.chemreg.chemreg.label.repository;

import com.chemreg.chemreg.label.entity.LabelPrintJob;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LabelPrintJobRepository extends JpaRepository<LabelPrintJob, UUID> {
List<LabelPrintJob> findByTenantId(UUID tenantId);
}
