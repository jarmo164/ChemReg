package com.chemreg.chemreg.site.repository;

import com.chemreg.chemreg.site.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LocationRepository extends JpaRepository<Location, UUID> {
List<Location> findBySiteId(UUID siteId);
}
