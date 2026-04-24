package com.chemreg.chemreg.inventory.service;

import com.chemreg.chemreg.chemical.entity.ChemicalProduct;
import com.chemreg.chemreg.chemical.repository.ChemicalProductRepository;
import com.chemreg.chemreg.common.exception.ResourceNotFoundException;
import com.chemreg.chemreg.common.security.AuthorizationRules;
import com.chemreg.chemreg.common.security.CurrentAccessContext;
import com.chemreg.chemreg.inventory.dto.InventoryItemResponse;
import com.chemreg.chemreg.inventory.dto.SaveInventoryItemRequest;
import com.chemreg.chemreg.inventory.entity.InventoryItem;
import com.chemreg.chemreg.inventory.repository.InventoryItemRepository;
import com.chemreg.chemreg.site.entity.Location;
import com.chemreg.chemreg.site.repository.LocationRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class InventoryItemService {

    private final InventoryItemRepository inventoryItemRepository;
    private final ChemicalProductRepository chemicalProductRepository;
    private final LocationRepository locationRepository;
    private final CurrentAccessContext currentAccessContext;

    public InventoryItemService(
            InventoryItemRepository inventoryItemRepository,
            ChemicalProductRepository chemicalProductRepository,
            LocationRepository locationRepository,
            CurrentAccessContext currentAccessContext
    ) {
        this.inventoryItemRepository = inventoryItemRepository;
        this.chemicalProductRepository = chemicalProductRepository;
        this.locationRepository = locationRepository;
        this.currentAccessContext = currentAccessContext;
    }

    @Transactional
    @PreAuthorize(AuthorizationRules.MVP_READ_ROLES)
    public List<InventoryItemResponse> listAllForCurrentTenant() {
        UUID tenantId = currentAccessContext.currentTenantId();
        return inventoryItemRepository.findByTenantId(tenantId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    @PreAuthorize(AuthorizationRules.MVP_READ_ROLES)
    public InventoryItemResponse getById(UUID id) {
        UUID tenantId = currentAccessContext.currentTenantId();
        InventoryItem item = inventoryItemRepository.findByIdAndTenant_Id(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found: " + id));
        return toResponse(item);
    }

    @Transactional
    @PreAuthorize(AuthorizationRules.MVP_MANAGE_ROLES)
    public InventoryItemResponse create(SaveInventoryItemRequest request) {
        UUID tenantId = currentAccessContext.currentTenantId();
        InventoryItem item = new InventoryItem();
        applyFields(item, request, tenantId);
        return toResponse(inventoryItemRepository.save(item));
    }

    @Transactional
    @PreAuthorize(AuthorizationRules.MVP_MANAGE_ROLES)
    public InventoryItemResponse update(UUID id, SaveInventoryItemRequest request) {
        UUID tenantId = currentAccessContext.currentTenantId();
        InventoryItem item = inventoryItemRepository.findByIdAndTenant_Id(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found: " + id));
        applyFields(item, request, tenantId);
        return toResponse(inventoryItemRepository.save(item));
    }

    @Transactional
    @PreAuthorize(AuthorizationRules.MVP_MANAGE_ROLES)
    public void delete(UUID id) {
        UUID tenantId = currentAccessContext.currentTenantId();
        InventoryItem item = inventoryItemRepository.findByIdAndTenant_Id(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found: " + id));
        inventoryItemRepository.delete(item);
    }

    private void applyFields(InventoryItem item, SaveInventoryItemRequest request, UUID tenantId) {
        ChemicalProduct product = chemicalProductRepository.findByIdAndTenant_Id(request.getProductId(), tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Chemical product not found: " + request.getProductId()));
        Location location = locationRepository.findByIdAndSite_Tenant_Id(request.getLocationId(), tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found: " + request.getLocationId()));

        item.setTenant(product.getTenant());
        item.setProduct(product);
        item.setLocation(location);
        item.setQuantity(request.getQuantity());
        item.setUnit(request.getUnit());
        item.setContainerType(trimToNull(request.getContainerType()));
        item.setBarcode(trimToNull(request.getBarcode()));
        item.setQrCode(trimToNull(request.getQrCode()));
        item.setLotNumber(trimToNull(request.getLotNumber()));
        item.setStatus(request.getStatus());
        item.setOpenedAt(request.getOpenedAt());
        item.setExpiryDate(request.getExpiryDate());
        item.setMinStock(request.getMinStock());
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private InventoryItemResponse toResponse(InventoryItem item) {
        InventoryItemResponse response = new InventoryItemResponse();
        response.setId(item.getId());
        response.setTenantId(item.getTenant().getId());
        response.setProductId(item.getProduct().getId());
        response.setProductName(item.getProduct().getName());
        response.setLocationId(item.getLocation().getId());
        response.setLocationName(item.getLocation().getName());
        response.setQuantity(item.getQuantity());
        response.setUnit(item.getUnit());
        response.setContainerType(item.getContainerType());
        response.setBarcode(item.getBarcode());
        response.setQrCode(item.getQrCode());
        response.setLotNumber(item.getLotNumber());
        response.setStatus(item.getStatus());
        response.setOpenedAt(item.getOpenedAt());
        response.setExpiryDate(item.getExpiryDate());
        response.setMinStock(item.getMinStock());
        response.setCreatedAt(item.getCreatedAt());
        response.setUpdatedAt(item.getUpdatedAt());
        return response;
    }
}
