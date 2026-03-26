package com.chemreg.chemreg.tenant.repository;

import com.chemreg.chemreg.tenant.entity.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TenantRepository extends JpaRepository<Tenant, UUID> {

}
