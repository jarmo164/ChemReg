package com.chemreg.chemreg.inventory.repository;

import com.chemreg.chemreg.inventory.entity.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, UUID> {
List<InventoryItem> findByTenantId(UUID tenantId);
}
