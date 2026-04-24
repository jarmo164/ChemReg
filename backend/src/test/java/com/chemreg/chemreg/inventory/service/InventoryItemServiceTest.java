package com.chemreg.chemreg.inventory.service;

import com.chemreg.chemreg.chemical.entity.ChemicalProduct;
import com.chemreg.chemreg.chemical.repository.ChemicalProductRepository;
import com.chemreg.chemreg.common.enums.InventoryStatus;
import com.chemreg.chemreg.common.enums.InventoryUnit;
import com.chemreg.chemreg.common.enums.LocationType;
import com.chemreg.chemreg.common.exception.ResourceNotFoundException;
import com.chemreg.chemreg.common.security.CurrentAccessContext;
import com.chemreg.chemreg.inventory.dto.SaveInventoryItemRequest;
import com.chemreg.chemreg.inventory.entity.InventoryItem;
import com.chemreg.chemreg.inventory.repository.InventoryItemRepository;
import com.chemreg.chemreg.site.entity.Location;
import com.chemreg.chemreg.site.entity.Site;
import com.chemreg.chemreg.site.repository.LocationRepository;
import com.chemreg.chemreg.tenant.entity.Tenant;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InventoryItemServiceTest {

    @Mock
    private InventoryItemRepository inventoryItemRepository;
    @Mock
    private ChemicalProductRepository chemicalProductRepository;
    @Mock
    private LocationRepository locationRepository;
    @Mock
    private CurrentAccessContext currentAccessContext;

    private InventoryItemService inventoryItemService;

    @BeforeEach
    void setUp() {
        inventoryItemService = new InventoryItemService(
                inventoryItemRepository,
                chemicalProductRepository,
                locationRepository,
                currentAccessContext
        );
    }

    @Test
    void listUsesTenantScope() {
        UUID tenantId = UUID.randomUUID();
        when(currentAccessContext.currentTenantId()).thenReturn(tenantId);
        when(inventoryItemRepository.findByTenantId(tenantId)).thenReturn(List.of());

        inventoryItemService.listAllForCurrentTenant();

        verify(inventoryItemRepository).findByTenantId(tenantId);
    }

    @Test
    void createRejectsCrossTenantProduct() {
        UUID tenantId = UUID.randomUUID();
        SaveInventoryItemRequest request = request(UUID.randomUUID(), UUID.randomUUID());

        when(currentAccessContext.currentTenantId()).thenReturn(tenantId);
        when(chemicalProductRepository.findByIdAndTenant_Id(request.getProductId(), tenantId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> inventoryItemService.create(request));
    }

    @Test
    void createRejectsCrossTenantLocation() {
        UUID tenantId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();
        UUID locationId = UUID.randomUUID();
        SaveInventoryItemRequest request = request(productId, locationId);

        when(currentAccessContext.currentTenantId()).thenReturn(tenantId);
        when(chemicalProductRepository.findByIdAndTenant_Id(productId, tenantId)).thenReturn(Optional.of(product(productId, tenantId)));
        when(locationRepository.findByIdAndSite_Tenant_Id(locationId, tenantId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> inventoryItemService.create(request));
    }

    @Test
    void createPersistsInventoryItem() {
        UUID tenantId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();
        UUID locationId = UUID.randomUUID();
        SaveInventoryItemRequest request = request(productId, locationId);

        when(currentAccessContext.currentTenantId()).thenReturn(tenantId);
        when(chemicalProductRepository.findByIdAndTenant_Id(productId, tenantId)).thenReturn(Optional.of(product(productId, tenantId)));
        when(locationRepository.findByIdAndSite_Tenant_Id(locationId, tenantId)).thenReturn(Optional.of(location(locationId, tenantId)));
        when(inventoryItemRepository.save(any(InventoryItem.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = inventoryItemService.create(request);

        assertEquals(productId, response.getProductId());
        assertEquals(locationId, response.getLocationId());
        assertEquals(new BigDecimal("12.500"), response.getQuantity());
        assertEquals(InventoryUnit.L, response.getUnit());
        assertEquals(InventoryStatus.in_stock, response.getStatus());
        assertEquals("Drum", response.getContainerType());
        assertEquals("LOT-42", response.getLotNumber());
    }

    private SaveInventoryItemRequest request(UUID productId, UUID locationId) {
        SaveInventoryItemRequest request = new SaveInventoryItemRequest();
        request.setProductId(productId);
        request.setLocationId(locationId);
        request.setQuantity(new BigDecimal("12.500"));
        request.setUnit(InventoryUnit.L);
        request.setContainerType(" Drum ");
        request.setLotNumber(" LOT-42 ");
        request.setStatus(InventoryStatus.in_stock);
        request.setMinStock(new BigDecimal("2.000"));
        return request;
    }

    private ChemicalProduct product(UUID productId, UUID tenantId) {
        Tenant tenant = new Tenant();
        tenant.setId(tenantId);

        ChemicalProduct product = new ChemicalProduct();
        product.setId(productId);
        product.setTenant(tenant);
        product.setName("Acetone");
        return product;
    }

    private Location location(UUID locationId, UUID tenantId) {
        Tenant tenant = new Tenant();
        tenant.setId(tenantId);

        Site site = new Site();
        site.setId(UUID.randomUUID());
        site.setTenant(tenant);
        site.setName("Main Site");
        site.setTimezone("Europe/Tallinn");

        Location location = new Location();
        location.setId(locationId);
        location.setSite(site);
        location.setName("Cabinet A");
        location.setType(LocationType.cabinet);
        return location;
    }
}
