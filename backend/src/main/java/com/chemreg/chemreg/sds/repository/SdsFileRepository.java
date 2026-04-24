package com.chemreg.chemreg.sds.repository;

import com.chemreg.chemreg.sds.entity.SdsFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SdsFileRepository extends JpaRepository<SdsFile, UUID> {

    List<SdsFile> findBySdsDocumentId(UUID sdsDocumentId);

    List<SdsFile> findBySdsDocumentIdOrderByCreatedAtDesc(UUID sdsDocumentId);

    Optional<SdsFile> findByIdAndSdsDocumentId(UUID id, UUID sdsDocumentId);

    Optional<SdsFile> findBySdsDocumentIdAndCurrentTrue(UUID sdsDocumentId);
}
