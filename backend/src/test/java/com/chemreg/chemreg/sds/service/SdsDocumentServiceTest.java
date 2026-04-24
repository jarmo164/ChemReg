package com.chemreg.chemreg.sds.service;

import com.chemreg.chemreg.common.exception.BadRequestException;
import com.chemreg.chemreg.common.exception.ResourceNotFoundException;
import com.chemreg.chemreg.common.enums.SdsDocumentStatus;
import com.chemreg.chemreg.common.enums.TenantPlan;
import com.chemreg.chemreg.common.security.CurrentAccessContext;
import com.chemreg.chemreg.sds.dto.SaveSdsDocumentRequest;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SdsDocumentServiceTest {

    @Mock
    private SdsDocumentRepository sdsDocumentRepository;
    @Mock
    private SdsSectionRepository sdsSectionRepository;
    @Mock
    private SdsSupplierLinkRepository sdsSupplierLinkRepository;
    @Mock
    private SdsFileRepository sdsFileRepository;
    @Mock
    private SupplierRepository supplierRepository;
    @Mock
    private TenantRepository tenantRepository;
    @Mock
    private CurrentAccessContext currentAccessContext;

    private SdsDocumentService sdsDocumentService;

    @BeforeEach
    void setUp() {
        sdsDocumentService = new SdsDocumentService(
                sdsDocumentRepository,
                sdsSectionRepository,
                sdsSupplierLinkRepository,
                sdsFileRepository,
                supplierRepository,
                tenantRepository,
                currentAccessContext
        );
    }

    @Test
    void listUsesAuthenticatedTenantScope() {
        UUID tenantId = UUID.randomUUID();
        when(currentAccessContext.currentTenantId()).thenReturn(tenantId);
        when(sdsDocumentRepository.findByTenantIdOrderByUpdatedAtDesc(tenantId)).thenReturn(List.of());

        sdsDocumentService.listAllForCurrentTenant();

        verify(sdsDocumentRepository).findByTenantIdOrderByUpdatedAtDesc(tenantId);
    }

    @Test
    void getByIdRejectsCrossTenantDirectObjectAccess() {
        UUID tenantId = UUID.randomUUID();
        UUID documentId = UUID.randomUUID();
        when(currentAccessContext.currentTenantId()).thenReturn(tenantId);
        when(sdsDocumentRepository.findByIdAndTenant_Id(documentId, tenantId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> sdsDocumentService.getById(documentId));

        verify(sdsDocumentRepository).findByIdAndTenant_Id(documentId, tenantId);
    }

    @Test
    void createRejectsDuplicateSectionNumbers() {
        UUID tenantId = UUID.randomUUID();
        when(currentAccessContext.currentTenantId()).thenReturn(tenantId);
        when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(tenant(tenantId)));
        when(sdsDocumentRepository.save(any(SdsDocument.class))).thenAnswer(invocation -> {
            SdsDocument document = invocation.getArgument(0);
            if (document.getId() == null) {
                document.setId(UUID.randomUUID());
            }
            return document;
        });

        SaveSdsDocumentRequest request = validRequest();
        request.setSections(List.of(
                section(1, "Identification", "A"),
                section(1, "Duplicate", "B")
        ));

        assertThrows(BadRequestException.class, () -> sdsDocumentService.create(request));
    }

    @Test
    void createRejectsSectionNumbersOutsideSupportedRange() {
        UUID tenantId = UUID.randomUUID();
        when(currentAccessContext.currentTenantId()).thenReturn(tenantId);
        when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(tenant(tenantId)));
        when(sdsDocumentRepository.save(any(SdsDocument.class))).thenAnswer(invocation -> {
            SdsDocument document = invocation.getArgument(0);
            if (document.getId() == null) {
                document.setId(UUID.randomUUID());
            }
            return document;
        });

        SaveSdsDocumentRequest request = validRequest();
        request.setSections(List.of(section(17, "Out of range", "Bad")));

        assertThrows(BadRequestException.class, () -> sdsDocumentService.create(request));
    }

    @Test
    void createRejectsInvalidRevisionDateFormat() {
        UUID tenantId = UUID.randomUUID();
        when(currentAccessContext.currentTenantId()).thenReturn(tenantId);
        when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(tenant(tenantId)));

        SaveSdsDocumentRequest request = validRequest();
        request.getDocument().setRevisionDate("24-04-2026");

        assertThrows(BadRequestException.class, () -> sdsDocumentService.create(request));
    }

    @Test
    void createRejectsSupplierIdsOutsideCurrentTenantScope() {
        UUID tenantId = UUID.randomUUID();
        UUID supplierId = UUID.randomUUID();
        when(currentAccessContext.currentTenantId()).thenReturn(tenantId);
        when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(tenant(tenantId)));
        when(sdsDocumentRepository.save(any(SdsDocument.class))).thenAnswer(invocation -> {
            SdsDocument document = invocation.getArgument(0);
            if (document.getId() == null) {
                document.setId(UUID.randomUUID());
            }
            return document;
        });

        Supplier crossTenantSupplier = supplier(UUID.randomUUID(), supplierId);
        when(supplierRepository.findAllById(List.of(supplierId))).thenReturn(List.of(crossTenantSupplier));

        SaveSdsDocumentRequest request = validRequest();
        request.setSupplierIds(List.of(supplierId));

        assertThrows(BadRequestException.class, () -> sdsDocumentService.create(request));

        verify(sdsSupplierLinkRepository, never()).saveAll(any());
    }

    @Test
    void createPersistsTrimmedDocumentFieldsAndScopedRelations() {
        UUID tenantId = UUID.randomUUID();
        UUID supplierId = UUID.randomUUID();
        when(currentAccessContext.currentTenantId()).thenReturn(tenantId);
        when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(tenant(tenantId)));
        when(sdsDocumentRepository.save(any(SdsDocument.class))).thenAnswer(invocation -> {
            SdsDocument document = invocation.getArgument(0);
            if (document.getId() == null) {
                document.setId(UUID.randomUUID());
            }
            return document;
        });
        when(sdsSectionRepository.findBySdsDocumentIdOrderBySectionNumber(any(UUID.class))).thenReturn(List.of());
        when(sdsSupplierLinkRepository.findBySdsDocumentId(any(UUID.class))).thenReturn(List.of());
        when(sdsFileRepository.findBySdsDocumentIdOrderByCreatedAtDesc(any(UUID.class))).thenReturn(List.of());

        Supplier supplier = supplier(tenantId, supplierId);
        when(supplierRepository.findAllById(List.of(supplierId))).thenReturn(List.of(supplier));

        SaveSdsDocumentRequest request = validRequest();
        request.getDocument().setProductName("  Acetone  ");
        request.getDocument().setSupplierNameRaw("  Merck  ");
        request.getDocument().setLanguage("  et  ");
        request.getDocument().setCountryFormat("  EE  ");
        request.getDocument().setRevisionDate("2026-04-24");
        request.getDocument().setExpiryDate("2026-05-24");
        request.setSupplierIds(List.of(supplierId));
        request.setSections(List.of(
                section(1, " Identification ", "  Basic details  "),
                section(3, " Composition ", "  CAS 67-64-1  ")
        ));

        sdsDocumentService.create(request);

        ArgumentCaptor<SdsDocument> documentCaptor = ArgumentCaptor.forClass(SdsDocument.class);
        verify(sdsDocumentRepository).save(documentCaptor.capture());
        SdsDocument savedDocument = documentCaptor.getValue();
        assertEquals("Acetone", savedDocument.getProductName());
        assertEquals("Merck", savedDocument.getSupplierNameRaw());
        assertEquals("et", savedDocument.getLanguage());
        assertEquals("EE", savedDocument.getCountryFormat());
        assertEquals(LocalDate.parse("2026-04-24"), savedDocument.getRevisionDate());
        assertEquals(LocalDate.parse("2026-05-24"), savedDocument.getExpiryDate());
        assertEquals(SdsDocumentStatus.active, savedDocument.getStatus());
        assertEquals(tenantId, savedDocument.getTenant().getId());

        ArgumentCaptor<List<SdsSection>> sectionCaptor = ArgumentCaptor.forClass(List.class);
        verify(sdsSectionRepository).saveAll(sectionCaptor.capture());
        List<SdsSection> savedSections = sectionCaptor.getValue();
        assertEquals(2, savedSections.size());
        assertEquals("Identification", savedSections.get(0).getTitle());
        assertEquals("Basic details", savedSections.get(0).getContent());
        assertEquals("Composition", savedSections.get(1).getTitle());
        assertEquals("CAS 67-64-1", savedSections.get(1).getContent());

        ArgumentCaptor<List<SdsSupplierLink>> linkCaptor = ArgumentCaptor.forClass(List.class);
        verify(sdsSupplierLinkRepository).saveAll(linkCaptor.capture());
        List<SdsSupplierLink> links = linkCaptor.getValue();
        assertEquals(1, links.size());
        assertEquals(supplierId, links.get(0).getSupplier().getId());
    }

    @Test
    void createNormalizesBlankSupplierNameToNull() {
        UUID tenantId = UUID.randomUUID();
        when(currentAccessContext.currentTenantId()).thenReturn(tenantId);
        when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(tenant(tenantId)));
        when(sdsDocumentRepository.save(any(SdsDocument.class))).thenAnswer(invocation -> {
            SdsDocument document = invocation.getArgument(0);
            if (document.getId() == null) {
                document.setId(UUID.randomUUID());
            }
            return document;
        });
        when(sdsSectionRepository.findBySdsDocumentIdOrderBySectionNumber(any(UUID.class))).thenReturn(List.of());
        when(sdsSupplierLinkRepository.findBySdsDocumentId(any(UUID.class))).thenReturn(List.of());
        when(sdsFileRepository.findBySdsDocumentIdOrderByCreatedAtDesc(any(UUID.class))).thenReturn(List.of());

        SaveSdsDocumentRequest request = validRequest();
        request.getDocument().setSupplierNameRaw("   ");

        sdsDocumentService.create(request);

        ArgumentCaptor<SdsDocument> documentCaptor = ArgumentCaptor.forClass(SdsDocument.class);
        verify(sdsDocumentRepository).save(documentCaptor.capture());
        assertNull(documentCaptor.getValue().getSupplierNameRaw());
    }

    private SaveSdsDocumentRequest validRequest() {
        SaveSdsDocumentRequest request = new SaveSdsDocumentRequest();
        SaveSdsDocumentRequest.DocumentPayload document = new SaveSdsDocumentRequest.DocumentPayload();
        document.setProductName("Acetone");
        document.setSupplierNameRaw("Merck");
        document.setLanguage("et");
        document.setCountryFormat("EE");
        document.setStatus(SdsDocumentStatus.active);
        request.setDocument(document);
        request.setSupplierIds(List.of());
        request.setSections(List.of(section(1, "Identification", "Basic details")));
        return request;
    }

    private SaveSdsDocumentRequest.SectionPayload section(int number, String title, String content) {
        SaveSdsDocumentRequest.SectionPayload section = new SaveSdsDocumentRequest.SectionPayload();
        section.setSectionNumber(number);
        section.setTitle(title);
        section.setContent(content);
        return section;
    }

    private Tenant tenant(UUID tenantId) {
        Tenant tenant = new Tenant();
        tenant.setId(tenantId);
        tenant.setName("Tenant");
        tenant.setPlan(TenantPlan.mvp);
        return tenant;
    }

    private Supplier supplier(UUID tenantId, UUID supplierId) {
        Supplier supplier = new Supplier();
        supplier.setId(supplierId);
        supplier.setName("Supplier");
        supplier.setTenant(tenant(tenantId));
        return supplier;
    }
}
