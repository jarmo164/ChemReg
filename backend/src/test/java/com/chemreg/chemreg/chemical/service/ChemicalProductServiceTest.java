package com.chemreg.chemreg.chemical.service;

import com.chemreg.chemreg.chemical.dto.SaveChemicalProductRequest;
import com.chemreg.chemreg.chemical.entity.ChemicalProduct;
import com.chemreg.chemreg.chemical.repository.ChemicalProductRepository;
import com.chemreg.chemreg.common.enums.InventoryUnit;
import com.chemreg.chemreg.common.exception.ResourceNotFoundException;
import com.chemreg.chemreg.common.security.CurrentAccessContext;
import com.chemreg.chemreg.sds.entity.SdsDocument;
import com.chemreg.chemreg.sds.repository.SdsDocumentRepository;
import com.chemreg.chemreg.tenant.repository.TenantRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChemicalProductServiceTest {

    @Mock
    private ChemicalProductRepository chemicalProductRepository;
    @Mock
    private TenantRepository tenantRepository;
    @Mock
    private SdsDocumentRepository sdsDocumentRepository;
    @Mock
    private CurrentAccessContext currentAccessContext;

    private ChemicalProductService chemicalProductService;

    @BeforeEach
    void setUp() {
        chemicalProductService = new ChemicalProductService(
                chemicalProductRepository,
                tenantRepository,
                sdsDocumentRepository,
                currentAccessContext
        );
    }

    @Test
    void listUsesAuthenticatedTenantScope() {
        UUID tenantId = UUID.randomUUID();
        when(currentAccessContext.currentTenantId()).thenReturn(tenantId);
        when(chemicalProductRepository.findByTenantId(tenantId)).thenReturn(java.util.List.of());

        chemicalProductService.listAllForCurrentTenant();

        verify(chemicalProductRepository).findByTenantId(tenantId);
    }

    @Test
    void getByIdRejectsCrossTenantDirectObjectAccess() {
        UUID tenantId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();
        when(currentAccessContext.currentTenantId()).thenReturn(tenantId);
        when(chemicalProductRepository.findByIdAndTenant_Id(productId, tenantId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> chemicalProductService.getById(productId));

        verify(chemicalProductRepository).findByIdAndTenant_Id(productId, tenantId);
    }

    @Test
    void createRejectsCrossTenantSdsLinkAttempt() {
        UUID tenantId = UUID.randomUUID();
        UUID sdsId = UUID.randomUUID();
        when(currentAccessContext.currentTenantId()).thenReturn(tenantId);
        when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(new com.chemreg.chemreg.tenant.entity.Tenant()));
        when(sdsDocumentRepository.findByIdAndTenant_Id(sdsId, tenantId)).thenReturn(Optional.empty());

        SaveChemicalProductRequest request = new SaveChemicalProductRequest();
        request.setName("Acetone");
        request.setSdsDocumentId(sdsId);

        assertThrows(ResourceNotFoundException.class, () -> chemicalProductService.create(request));
    }

    @Test
    void createAllowsTenantScopedSdsLink() {
        UUID tenantId = UUID.randomUUID();
        UUID sdsId = UUID.randomUUID();
        com.chemreg.chemreg.tenant.entity.Tenant tenant = new com.chemreg.chemreg.tenant.entity.Tenant();
        tenant.setId(tenantId);

        when(currentAccessContext.currentTenantId()).thenReturn(tenantId);
        when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(tenant));

        SdsDocument sdsDocument = new SdsDocument();
        sdsDocument.setId(sdsId);
        sdsDocument.setTenant(tenant);
        when(sdsDocumentRepository.findByIdAndTenant_Id(sdsId, tenantId)).thenReturn(Optional.of(sdsDocument));
        when(chemicalProductRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        SaveChemicalProductRequest request = new SaveChemicalProductRequest();
        request.setName("Acetone");
        request.setSdsDocumentId(sdsId);

        chemicalProductService.create(request);

        verify(sdsDocumentRepository).findByIdAndTenant_Id(sdsId, tenantId);
        verify(chemicalProductRepository).save(any());
    }

    @Test
    void createPersistsExpandedMetadataForDownstreamFlows() {
        UUID tenantId = UUID.randomUUID();
        com.chemreg.chemreg.tenant.entity.Tenant tenant = new com.chemreg.chemreg.tenant.entity.Tenant();
        tenant.setId(tenantId);

        when(currentAccessContext.currentTenantId()).thenReturn(tenantId);
        when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(tenant));
        when(chemicalProductRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        SaveChemicalProductRequest request = new SaveChemicalProductRequest();
        request.setName("  Acetone  ");
        request.setCasNumber(" 67-64-1 ");
        request.setEcNumber(" 200-662-2 ");
        request.setProductCode(" ACETONE-001 ");
        request.setSupplierName(" Merck ");
        request.setDefaultUnit(InventoryUnit.L);
        request.setStorageClass("Flammables cabinet");
        request.setUseDescription(" Lab solvent ");
        request.setRestricted(Boolean.TRUE);

        var response = chemicalProductService.create(request);

        assertEquals("Acetone", response.getName());
        assertEquals("67-64-1", response.getCasNumber());
        assertEquals("200-662-2", response.getEcNumber());
        assertEquals("ACETONE-001", response.getProductCode());
        assertEquals("Merck", response.getSupplierName());
        assertEquals(InventoryUnit.L, response.getDefaultUnit());
        assertEquals("Flammables cabinet", response.getStorageClass());
        assertEquals("Lab solvent", response.getUseDescription());
        assertEquals(Boolean.TRUE, response.getRestricted());
    }
}
