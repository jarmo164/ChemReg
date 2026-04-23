package com.chemreg.chemreg.chemical.service;

import com.chemreg.chemreg.chemical.ChemicalIntegrationStubs;
import com.chemreg.chemreg.chemical.StubTenantProvisioner;
import com.chemreg.chemreg.chemical.dto.ChemicalProductResponse;
import com.chemreg.chemreg.chemical.dto.SaveChemicalProductRequest;
import com.chemreg.chemreg.chemical.entity.ChemicalProduct;
import com.chemreg.chemreg.chemical.repository.ChemicalProductRepository;
import com.chemreg.chemreg.common.exception.ResourceNotFoundException;
import com.chemreg.chemreg.common.security.AuthorizationRules;
import com.chemreg.chemreg.tenant.entity.Tenant;
import com.chemreg.chemreg.tenant.repository.TenantRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ChemicalProductService {

    private final ChemicalProductRepository chemicalProductRepository;
    private final TenantRepository tenantRepository;
    private final StubTenantProvisioner stubTenantProvisioner;

    public ChemicalProductService(
            ChemicalProductRepository chemicalProductRepository,
            TenantRepository tenantRepository,
            StubTenantProvisioner stubTenantProvisioner
    ) {
        this.chemicalProductRepository = chemicalProductRepository;
        this.tenantRepository = tenantRepository;
        this.stubTenantProvisioner = stubTenantProvisioner;
    }

    @Transactional
    @PreAuthorize(AuthorizationRules.MVP_MANAGE_ROLES)
    public ChemicalProductResponse create(SaveChemicalProductRequest request) {
        stubTenantProvisioner.ensureStubTenantExists();
        Tenant tenant = tenantRepository.findById(ChemicalIntegrationStubs.STUB_TENANT_ID)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Tenant not found: " + ChemicalIntegrationStubs.STUB_TENANT_ID));

        ChemicalProduct product = new ChemicalProduct();
        product.setTenant(tenant);
        applyRequestFields(product, request);

        // TODO(team/sds): When SDS linking API exists, set SdsDocument from a validated id for this tenant.
        // New products intentionally have no SDS association from this endpoint.

        ChemicalProduct saved = chemicalProductRepository.save(product);
        return toResponse(saved);
    }

    @Transactional
    @PreAuthorize(AuthorizationRules.MVP_READ_ROLES)
    public List<ChemicalProductResponse> listAllForStubTenant() {
        return chemicalProductRepository.findByTenantId(ChemicalIntegrationStubs.STUB_TENANT_ID).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    @PreAuthorize(AuthorizationRules.MVP_READ_ROLES)
    public ChemicalProductResponse getById(UUID id) {
        ChemicalProduct product = chemicalProductRepository
                .findByIdAndTenant_Id(id, ChemicalIntegrationStubs.STUB_TENANT_ID)
                .orElseThrow(() -> new ResourceNotFoundException("Chemical product not found: " + id));
        return toResponse(product);
    }

    @Transactional
    @PreAuthorize(AuthorizationRules.MVP_MANAGE_ROLES)
    public ChemicalProductResponse update(UUID id, SaveChemicalProductRequest request) {
        ChemicalProduct product = chemicalProductRepository
                .findByIdAndTenant_Id(id, ChemicalIntegrationStubs.STUB_TENANT_ID)
                .orElseThrow(() -> new ResourceNotFoundException("Chemical product not found: " + id));

        applyRequestFields(product, request);
        // Do not modify sdsDocument here; SDS workstream will own linking.

        return toResponse(chemicalProductRepository.save(product));
    }

    @Transactional
    @PreAuthorize(AuthorizationRules.MVP_MANAGE_ROLES)
    public void delete(UUID id) {
        ChemicalProduct product = chemicalProductRepository
                .findByIdAndTenant_Id(id, ChemicalIntegrationStubs.STUB_TENANT_ID)
                .orElseThrow(() -> new ResourceNotFoundException("Chemical product not found: " + id));
        chemicalProductRepository.delete(product);
    }

    private void applyRequestFields(ChemicalProduct product, SaveChemicalProductRequest request) {
        product.setName(request.getName().trim());
        product.setCasNumber(request.getCasNumber());
        product.setEcNumber(request.getEcNumber());
        product.setSignalWord(request.getSignalWord());
        product.setPhysicalState(request.getPhysicalState());
        product.setRestricted(request.getRestricted() != null ? request.getRestricted() : Boolean.FALSE);
    }

    private ChemicalProductResponse toResponse(ChemicalProduct product) {
        ChemicalProductResponse response = new ChemicalProductResponse();
        response.setId(product.getId());
        response.setTenantId(product.getTenant().getId());
        if (product.getSdsDocument() != null) {
            response.setSdsDocumentId(product.getSdsDocument().getId());
        } else {
            response.setSdsDocumentId(null);
        }
        response.setName(product.getName());
        response.setCasNumber(product.getCasNumber());
        response.setEcNumber(product.getEcNumber());
        response.setSignalWord(product.getSignalWord());
        response.setPhysicalState(product.getPhysicalState());
        response.setRestricted(product.getRestricted());
        response.setCreatedAt(product.getCreatedAt());
        response.setUpdatedAt(product.getUpdatedAt());
        return response;
    }
}
