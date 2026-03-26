package com.chemreg.chemreg.workflow.repository;

import com.chemreg.chemreg.workflow.entity.Approval;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ApprovalRepository extends JpaRepository<Approval, UUID> {
List<Approval> findByTenantId(UUID tenantId);
}
