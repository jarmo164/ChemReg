package com.chemreg.chemreg.chemical.repository;

import com.chemreg.chemreg.chemical.entity.ChemicalProduct;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChemicalProductRepository extends JpaRepository<ChemicalProduct, UUID> {

    List<ChemicalProduct> findByTenantId(UUID tenantId);

    Optional<ChemicalProduct> findByIdAndTenant_Id(UUID id, UUID tenantId);
}
