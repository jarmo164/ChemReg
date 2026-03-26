package com.chemreg.chemreg.supplier.repository;

import com.chemreg.chemreg.supplier.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SupplierRepository extends JpaRepository<Supplier, UUID> {
List<Supplier> findByTenantId(UUID tenantId);
}
