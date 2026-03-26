package com.chemreg.chemreg.label.repository;

import com.chemreg.chemreg.label.entity.AssetTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AssetTemplateRepository extends JpaRepository<AssetTemplate, UUID> {
List<AssetTemplate> findByTenantId(UUID tenantId);
}
