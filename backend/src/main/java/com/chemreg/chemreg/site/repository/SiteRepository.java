package com.chemreg.chemreg.site.repository;

import com.chemreg.chemreg.site.entity.Site;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SiteRepository extends JpaRepository<Site, UUID> {
    List<Site> findByTenantId(UUID tenantId);

    Optional<Site> findByIdAndTenant_Id(UUID id, UUID tenantId);
}
