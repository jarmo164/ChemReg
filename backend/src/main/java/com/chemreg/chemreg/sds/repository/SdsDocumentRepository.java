package com.chemreg.chemreg.sds.repository;

import com.chemreg.chemreg.sds.entity.SdsDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SdsDocumentRepository extends JpaRepository<SdsDocument, UUID> {
List<SdsDocument> findByTenantId(UUID tenantId);
}
