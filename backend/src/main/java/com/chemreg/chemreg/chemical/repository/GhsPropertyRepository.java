package com.chemreg.chemreg.chemical.repository;

import com.chemreg.chemreg.chemical.entity.GhsProperty;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GhsPropertyRepository extends JpaRepository<GhsProperty, UUID> {
List<GhsProperty> findByProductId(UUID productId);
}
