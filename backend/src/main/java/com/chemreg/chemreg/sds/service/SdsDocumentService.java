package com.chemreg.chemreg.sds.service;

import com.chemreg.chemreg.common.exception.BadRequestException;
import com.chemreg.chemreg.common.exception.ResourceNotFoundException;
import com.chemreg.chemreg.common.security.AuthorizationRules;
import com.chemreg.chemreg.common.security.CurrentAccessContext;
import com.chemreg.chemreg.sds.dto.SaveSdsDocumentRequest;
import com.chemreg.chemreg.sds.dto.SdsDocumentResponse;
import com.chemreg.chemreg.sds.entity.SdsDocument;
import com.chemreg.chemreg.sds.entity.SdsSection;
import com.chemreg.chemreg.sds.entity.SdsSupplierLink;
import com.chemreg.chemreg.sds.repository.SdsDocumentRepository;
import com.chemreg.chemreg.sds.repository.SdsFileRepository;
import com.chemreg.chemreg.sds.repository.SdsSectionRepository;
import com.chemreg.chemreg.sds.repository.SdsSupplierLinkRepository;
import com.chemreg.chemreg.supplier.entity.Supplier;
import com.chemreg.chemreg.supplier.repository.SupplierRepository;
import com.chemreg.chemreg.tenant.entity.Tenant;
import com.chemreg.chemreg.tenant.repository.TenantRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class SdsDocumentService {

    private final SdsDocumentRepository sdsDocumentRepository;
    private final SdsSectionRepository sdsSectionRepository;
    private final SdsSupplierLinkRepository sdsSupplierLinkRepository;
    private final SdsFileRepository sdsFileRepository;
    private final SupplierRepository supplierRepository;
    private final TenantRepository tenantRepository;
    private final CurrentAccessContext currentAccessContext;

    public SdsDocumentService(
            SdsDocumentRepository sdsDocumentRepository,
            SdsSectionRepository sdsSectionRepository,
            SdsSupplierLinkRepository sdsSupplierLinkRepository,
            SdsFileRepository sdsFileRepository,
            SupplierRepository supplierRepository,
            TenantRepository tenantRepository,
            CurrentAccessContext currentAccessContext
    ) {
        this.sdsDocumentRepository = sdsDocumentRepository;
        this.sdsSectionRepository = sdsSectionRepository;
        this.sdsSupplierLinkRepository = sdsSupplierLinkRepository;
        this.sdsFileRepository = sdsFileRepository;
        this.supplierRepository = supplierRepository;
        this.tenantRepository = tenantRepository;
        this.currentAccessContext = currentAccessContext;
    }

    @Transactional
    @PreAuthorize(AuthorizationRules.MVP_READ_ROLES)
    public List<SdsDocumentResponse> listAllForCurrentTenant() {
        UUID tenantId = currentAccessContext.currentTenantId();
        return sdsDocumentRepository.findByTenantIdOrderByUpdatedAtDesc(tenantId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    @PreAuthorize(AuthorizationRules.MVP_READ_ROLES)
    public SdsDocumentResponse getById(UUID id) {
        return toResponse(requireDocumentForCurrentTenant(id));
    }

    @Transactional
    @PreAuthorize(AuthorizationRules.MVP_MANAGE_ROLES)
    public SdsDocumentResponse create(SaveSdsDocumentRequest request) {
        UUID tenantId = currentAccessContext.currentTenantId();
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found: " + tenantId));

        SdsDocument document = new SdsDocument();
        document.setTenant(tenant);
        applyDocumentFields(document, request);
        SdsDocument saved = sdsDocumentRepository.save(document);

        replaceSections(saved, request.getSections());
        replaceSupplierLinks(saved, tenantId, request.getSupplierIds());

        return toResponse(saved);
    }

    @Transactional
    @PreAuthorize(AuthorizationRules.MVP_MANAGE_ROLES)
    public SdsDocumentResponse update(UUID id, SaveSdsDocumentRequest request) {
        UUID tenantId = currentAccessContext.currentTenantId();
        SdsDocument document = requireDocumentForCurrentTenant(id);

        applyDocumentFields(document, request);
        SdsDocument saved = sdsDocumentRepository.save(document);

        replaceSections(saved, request.getSections());
        replaceSupplierLinks(saved, tenantId, request.getSupplierIds());

        return toResponse(saved);
    }

    private SdsDocument requireDocumentForCurrentTenant(UUID id) {
        UUID tenantId = currentAccessContext.currentTenantId();
        return sdsDocumentRepository.findByIdAndTenant_Id(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("SDS document not found: " + id));
    }

    private void applyDocumentFields(SdsDocument document, SaveSdsDocumentRequest request) {
        SaveSdsDocumentRequest.DocumentPayload payload = request.getDocument();
        document.setProductName(payload.getProductName().trim());
        document.setSupplierNameRaw(trimToNull(payload.getSupplierNameRaw()));
        document.setLanguage(payload.getLanguage().trim());
        document.setCountryFormat(payload.getCountryFormat().trim());
        document.setRevisionDate(parseOptionalDate(payload.getRevisionDate(), "revisionDate"));
        document.setExpiryDate(parseOptionalDate(payload.getExpiryDate(), "expiryDate"));
        document.setStatus(payload.getStatus());
    }

    private void replaceSections(SdsDocument document, List<SaveSdsDocumentRequest.SectionPayload> sections) {
        validateSections(sections);
        sdsSectionRepository.deleteBySdsDocumentId(document.getId());

        List<SdsSection> sectionEntities = sections.stream()
                .map(section -> toSectionEntity(document, section))
                .toList();
        sdsSectionRepository.saveAll(sectionEntities);
    }

    private SdsSection toSectionEntity(SdsDocument document, SaveSdsDocumentRequest.SectionPayload section) {
        SdsSection entity = new SdsSection();
        entity.setSdsDocument(document);
        entity.setSectionNumber(section.getSectionNumber());
        entity.setTitle(section.getTitle().trim());
        entity.setContent(section.getContent().trim());
        return entity;
    }

    private void replaceSupplierLinks(SdsDocument document, UUID tenantId, List<UUID> supplierIds) {
        sdsSupplierLinkRepository.deleteBySdsDocumentId(document.getId());
        if (supplierIds == null || supplierIds.isEmpty()) {
            return;
        }

        List<Supplier> suppliers = supplierRepository.findAllById(supplierIds).stream()
                .filter(supplier -> tenantId.equals(supplier.getTenant().getId()))
                .toList();

        if (suppliers.size() != supplierIds.size()) {
            throw new BadRequestException("One or more supplierIds do not exist in the current tenant scope.");
        }

        List<SdsSupplierLink> links = suppliers.stream()
                .map(supplier -> {
                    SdsSupplierLink link = new SdsSupplierLink();
                    link.setSdsDocument(document);
                    link.setSupplier(supplier);
                    return link;
                })
                .toList();
        sdsSupplierLinkRepository.saveAll(links);
    }

    private void validateSections(List<SaveSdsDocumentRequest.SectionPayload> sections) {
        Set<Integer> seen = new HashSet<>();
        for (SaveSdsDocumentRequest.SectionPayload section : sections) {
            Integer sectionNumber = section.getSectionNumber();
            if (sectionNumber == null || sectionNumber < 1 || sectionNumber > 16) {
                throw new BadRequestException("sectionNumber must be between 1 and 16.");
            }
            if (!seen.add(sectionNumber)) {
                throw new BadRequestException("Duplicate sectionNumber values are not allowed.");
            }
        }
    }

    private LocalDate parseOptionalDate(String rawValue, String fieldName) {
        if (rawValue == null || rawValue.isBlank()) {
            return null;
        }

        try {
            return LocalDate.parse(rawValue.trim());
        } catch (DateTimeParseException exception) {
            throw new BadRequestException("Invalid " + fieldName + " format. Expected YYYY-MM-DD.");
        }
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private SdsDocumentResponse toResponse(SdsDocument document) {
        SdsDocumentResponse response = new SdsDocumentResponse();
        response.setId(document.getId());
        response.setTenantId(document.getTenant().getId());
        response.setProductName(document.getProductName());
        response.setSupplierNameRaw(document.getSupplierNameRaw());
        response.setLanguage(document.getLanguage());
        response.setCountryFormat(document.getCountryFormat());
        response.setRevisionDate(document.getRevisionDate() != null ? document.getRevisionDate().toString() : null);
        response.setExpiryDate(document.getExpiryDate() != null ? document.getExpiryDate().toString() : null);
        response.setStatus(document.getStatus());
        response.setSupplierIds(sdsSupplierLinkRepository.findBySdsDocumentId(document.getId()).stream()
                .map(link -> link.getSupplier().getId())
                .toList());
        response.setSections(sdsSectionRepository.findBySdsDocumentIdOrderBySectionNumber(document.getId()).stream()
                .sorted(Comparator.comparing(SdsSection::getSectionNumber))
                .map(section -> {
                    SdsDocumentResponse.SectionResponse sectionResponse = new SdsDocumentResponse.SectionResponse();
                    sectionResponse.setId(section.getId());
                    sectionResponse.setSectionNumber(section.getSectionNumber());
                    sectionResponse.setTitle(section.getTitle());
                    sectionResponse.setContent(section.getContent());
                    sectionResponse.setCreatedAt(section.getCreatedAt());
                    return sectionResponse;
                })
                .toList());
        response.setFiles(sdsFileRepository.findBySdsDocumentIdOrderByCreatedAtDesc(document.getId()).stream()
                .map(this::toFileResponse)
                .toList());
        response.setCreatedAt(document.getCreatedAt());
        response.setUpdatedAt(document.getUpdatedAt());
        return response;
    }

    private com.chemreg.chemreg.sds.dto.SdsFileResponse toFileResponse(com.chemreg.chemreg.sds.entity.SdsFile sdsFile) {
        com.chemreg.chemreg.sds.dto.SdsFileResponse response = new com.chemreg.chemreg.sds.dto.SdsFileResponse();
        response.setId(sdsFile.getId());
        response.setStorageKey(sdsFile.getS3Key());
        response.setFilename(extractFilename(sdsFile.getS3Key()));
        response.setFileSizeBytes(sdsFile.getFileSizeBytes());
        response.setExtractedText(sdsFile.getExtractedText());
        response.setCurrent(sdsFile.getCurrent());
        response.setCreatedAt(sdsFile.getCreatedAt());
        return response;
    }

    private String extractFilename(String storageKey) {
        if (storageKey == null || storageKey.isBlank()) {
            return "unknown";
        }

        int separatorIndex = storageKey.lastIndexOf('/');
        return separatorIndex >= 0 ? storageKey.substring(separatorIndex + 1) : storageKey;
    }
}
