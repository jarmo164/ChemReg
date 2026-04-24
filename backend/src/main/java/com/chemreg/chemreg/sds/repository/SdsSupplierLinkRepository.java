package com.chemreg.chemreg.sds.repository;

import com.chemreg.chemreg.sds.entity.SdsSupplierLink;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SdsSupplierLinkRepository extends JpaRepository<SdsSupplierLink, UUID> {

    List<SdsSupplierLink> findBySdsDocumentId(UUID sdsDocumentId);

    void deleteBySdsDocumentId(UUID sdsDocumentId);
}
