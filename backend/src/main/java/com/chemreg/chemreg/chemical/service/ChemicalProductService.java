package com.chemreg.chemreg.chemical.service;

import com.chemreg.chemreg.chemical.dto.ChemicalProductResponse;
import com.chemreg.chemreg.chemical.dto.SaveChemicalProductRequest;
import com.chemreg.chemreg.chemical.entity.ChemicalProduct;
import com.chemreg.chemreg.chemical.repository.ChemicalProductRepository;
import com.chemreg.chemreg.common.exception.ResourceNotFoundException;
import com.chemreg.chemreg.common.security.AuthorizationRules;
import com.chemreg.chemreg.common.security.CurrentAccessContext;
import com.chemreg.chemreg.sds.entity.SdsDocument;
import com.chemreg.chemreg.sds.repository.SdsDocumentRepository;
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
    private final SdsDocumentRepository sdsDocumentRepository;
    private final CurrentAccessContext currentAccessContext;

    public ChemicalProductService(
            ChemicalProductRepository chemicalProductRepository,
            TenantRepository tenantRepository,
            SdsDocumentRepository sdsDocumentRepository,
            CurrentAccessContext currentAccessContext
    ) {
        this.chemicalProductRepository = chemicalProductRepository;
        this.tenantRepository = tenantRepository;
        this.sdsDocumentRepository = sdsDocumentRepository;
        this.currentAccessContext = currentAccessContext;
    }

    @Transactional
    @PreAuthorize(AuthorizationRules.MVP_MANAGE_ROLES)
    public ChemicalProductResponse create(SaveChemicalProductRequest request) {
        UUID tenantId = currentAccessContext.currentTenantId();
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Tenant not found: " + tenantId));

        ChemicalProduct product = new ChemicalProduct();
        product.setTenant(tenant);
        applyRequestFields(product, request, tenantId);

        ChemicalProduct saved = chemicalProductRepository.save(product);
        return toResponse(saved);
    }

    @Transactional
    @PreAuthorize(AuthorizationRules.MVP_READ_ROLES)
    public List<ChemicalProductResponse> listAllForCurrentTenant() {
        return chemicalProductRepository.findByTenantId(currentAccessContext.currentTenantId()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    @PreAuthorize(AuthorizationRules.MVP_READ_ROLES)
    public ChemicalProductResponse getById(UUID id) {
        UUID tenantId = currentAccessContext.currentTenantId();
        ChemicalProduct product = chemicalProductRepository
                .findByIdAndTenant_Id(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Chemical product not found: " + id));
        return toResponse(product);
    }

    @Transactional
    @PreAuthorize(AuthorizationRules.MVP_MANAGE_ROLES)
    public ChemicalProductResponse update(UUID id, SaveChemicalProductRequest request) {
        UUID tenantId = currentAccessContext.currentTenantId();
        ChemicalProduct product = chemicalProductRepository
                .findByIdAndTenant_Id(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Chemical product not found: " + id));

        applyRequestFields(product, request, tenantId);

        return toResponse(chemicalProductRepository.save(product));
    }

    @Transactional
    @PreAuthorize(AuthorizationRules.MVP_MANAGE_ROLES)
    public void delete(UUID id) {
        UUID tenantId = currentAccessContext.currentTenantId();
        ChemicalProduct product = chemicalProductRepository
                .findByIdAndTenant_Id(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Chemical product not found: " + id));
        chemicalProductRepository.delete(product);
    }

    private void applyRequestFields(ChemicalProduct product, SaveChemicalProductRequest request, UUID tenantId) {
        product.setName(request.getName().trim());
        product.setCasNumber(trimToNull(request.getCasNumber()));
        product.setEcNumber(trimToNull(request.getEcNumber()));
        product.setSignalWord(request.getSignalWord());
        product.setPhysicalState(request.getPhysicalState());
        product.setRestricted(request.getRestricted() != null ? request.getRestricted() : Boolean.FALSE);
        product.setSdsDocument(resolveScopedSdsDocument(request.getSdsDocumentId(), tenantId));
    }

    private SdsDocument resolveScopedSdsDocument(UUID sdsDocumentId, UUID tenantId) {
        if (sdsDocumentId == null) {
            return null;
        }

        return sdsDocumentRepository.findByIdAndTenant_Id(sdsDocumentId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("SDS document not found: " + sdsDocumentId));
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
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
