package com.chemreg.chemreg.site.service;

import com.chemreg.chemreg.common.enums.LocationType;
import com.chemreg.chemreg.common.exception.BadRequestException;
import com.chemreg.chemreg.common.exception.ResourceNotFoundException;
import com.chemreg.chemreg.common.security.CurrentAccessContext;
import com.chemreg.chemreg.site.dto.SaveLocationRequest;
import com.chemreg.chemreg.site.dto.SaveSiteRequest;
import com.chemreg.chemreg.site.entity.Location;
import com.chemreg.chemreg.site.entity.Site;
import com.chemreg.chemreg.site.repository.LocationRepository;
import com.chemreg.chemreg.site.repository.SiteRepository;
import com.chemreg.chemreg.tenant.entity.Tenant;
import com.chemreg.chemreg.tenant.repository.TenantRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SiteLocationServiceTest {

    @Mock
    private SiteRepository siteRepository;
    @Mock
    private LocationRepository locationRepository;
    @Mock
    private TenantRepository tenantRepository;
    @Mock
    private CurrentAccessContext currentAccessContext;

    private SiteLocationService siteLocationService;

    @BeforeEach
    void setUp() {
        siteLocationService = new SiteLocationService(siteRepository, locationRepository, tenantRepository, currentAccessContext);
    }

    @Test
    void listSitesUsesTenantScope() {
        UUID tenantId = UUID.randomUUID();
        when(currentAccessContext.currentTenantId()).thenReturn(tenantId);
        when(siteRepository.findByTenantId(tenantId)).thenReturn(List.of());

        siteLocationService.listSites();

        verify(siteRepository).findByTenantId(tenantId);
    }

    @Test
    void createLocationRejectsCrossTenantParentLocation() {
        UUID tenantId = UUID.randomUUID();
        UUID siteId = UUID.randomUUID();
        UUID parentId = UUID.randomUUID();
        Site site = site(siteId, tenantId);

        when(currentAccessContext.currentTenantId()).thenReturn(tenantId);
        when(siteRepository.findByIdAndTenant_Id(siteId, tenantId)).thenReturn(Optional.of(site));

        SaveLocationRequest request = new SaveLocationRequest();
        request.setName("Shelf A");
        request.setType(LocationType.shelf);
        request.setParentId(parentId);

        when(locationRepository.findByIdAndSite_Tenant_Id(parentId, tenantId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> siteLocationService.createLocation(siteId, request));
    }

    @Test
    void createLocationRejectsParentFromDifferentSite() {
        UUID tenantId = UUID.randomUUID();
        UUID siteId = UUID.randomUUID();
        UUID otherSiteId = UUID.randomUUID();
        UUID parentId = UUID.randomUUID();
        Site site = site(siteId, tenantId);
        Site otherSite = site(otherSiteId, tenantId);
        Location parent = location(parentId, otherSite, null, LocationType.room);

        when(currentAccessContext.currentTenantId()).thenReturn(tenantId);
        when(siteRepository.findByIdAndTenant_Id(siteId, tenantId)).thenReturn(Optional.of(site));
        when(locationRepository.findByIdAndSite_Tenant_Id(parentId, tenantId)).thenReturn(Optional.of(parent));

        SaveLocationRequest request = new SaveLocationRequest();
        request.setName("Shelf A");
        request.setType(LocationType.shelf);
        request.setParentId(parentId);

        assertThrows(BadRequestException.class, () -> siteLocationService.createLocation(siteId, request));
    }

    @Test
    void createSiteAndLocationPersistTrimmedFields() {
        UUID tenantId = UUID.randomUUID();
        UUID siteId = UUID.randomUUID();
        Tenant tenant = new Tenant();
        tenant.setId(tenantId);
        Site site = site(siteId, tenantId);

        when(currentAccessContext.currentTenantId()).thenReturn(tenantId);
        when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(tenant));
        when(siteRepository.save(any(Site.class))).thenAnswer(invocation -> {
            Site candidate = invocation.getArgument(0);
            if (candidate.getId() == null) {
                candidate.setId(siteId);
            }
            return candidate;
        });
        when(siteRepository.findByIdAndTenant_Id(siteId, tenantId)).thenReturn(Optional.of(site));
        when(locationRepository.save(any(Location.class))).thenAnswer(invocation -> {
            Location candidate = invocation.getArgument(0);
            if (candidate.getId() == null) {
                candidate.setId(UUID.randomUUID());
            }
            return candidate;
        });

        SaveSiteRequest siteRequest = new SaveSiteRequest();
        siteRequest.setName(" Main Plant ");
        siteRequest.setTimezone(" Europe/Tallinn ");

        var savedSite = siteLocationService.createSite(siteRequest);

        SaveLocationRequest locationRequest = new SaveLocationRequest();
        locationRequest.setName(" Mixing Room ");
        locationRequest.setType(LocationType.room);

        var savedLocation = siteLocationService.createLocation(siteId, locationRequest);

        assertEquals("Main Plant", savedSite.getName());
        assertEquals("Europe/Tallinn", savedSite.getTimezone());
        assertEquals("Mixing Room", savedLocation.getName());
        assertEquals(LocationType.room, savedLocation.getType());
        assertEquals(siteId, savedLocation.getSiteId());
    }

    private Site site(UUID siteId, UUID tenantId) {
        Tenant tenant = new Tenant();
        tenant.setId(tenantId);

        Site site = new Site();
        site.setId(siteId);
        site.setTenant(tenant);
        site.setName("Site");
        site.setTimezone("Europe/Tallinn");
        return site;
    }

    private Location location(UUID id, Site site, Location parent, LocationType type) {
        Location location = new Location();
        location.setId(id);
        location.setSite(site);
        location.setParent(parent);
        location.setName("Location");
        location.setType(type);
        return location;
    }
}
