package com.chemreg.chemreg.sds.repository;

import com.chemreg.chemreg.sds.entity.SdsSection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SdsSectionRepository extends JpaRepository<SdsSection, UUID> {

    List<SdsSection> findBySdsDocumentIdOrderBySectionNumber(UUID sdsDocumentId);

    void deleteBySdsDocumentId(UUID sdsDocumentId);
}
