package com.chemreg.chemreg.audit.repository;

import com.chemreg.chemreg.audit.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
List<AuditLog> findByTenantId(UUID tenantId);
}
