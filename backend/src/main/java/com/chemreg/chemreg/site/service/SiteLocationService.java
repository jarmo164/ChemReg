package com.chemreg.chemreg.site.service;

import com.chemreg.chemreg.common.exception.BadRequestException;
import com.chemreg.chemreg.common.exception.ResourceNotFoundException;
import com.chemreg.chemreg.common.security.AuthorizationRules;
import com.chemreg.chemreg.common.security.CurrentAccessContext;
import com.chemreg.chemreg.site.dto.LocationResponse;
import com.chemreg.chemreg.site.dto.SaveLocationRequest;
import com.chemreg.chemreg.site.dto.SaveSiteRequest;
import com.chemreg.chemreg.site.dto.SiteResponse;
import com.chemreg.chemreg.site.entity.Location;
import com.chemreg.chemreg.site.entity.Site;
import com.chemreg.chemreg.site.repository.LocationRepository;
import com.chemreg.chemreg.site.repository.SiteRepository;
import com.chemreg.chemreg.tenant.entity.Tenant;
import com.chemreg.chemreg.tenant.repository.TenantRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class SiteLocationService {

    private final SiteRepository siteRepository;
    private final LocationRepository locationRepository;
    private final TenantRepository tenantRepository;
    private final CurrentAccessContext currentAccessContext;

    public SiteLocationService(
            SiteRepository siteRepository,
            LocationRepository locationRepository,
            TenantRepository tenantRepository,
            CurrentAccessContext currentAccessContext
    ) {
        this.siteRepository = siteRepository;
        this.locationRepository = locationRepository;
        this.tenantRepository = tenantRepository;
        this.currentAccessContext = currentAccessContext;
    }

    @Transactional
    @PreAuthorize(AuthorizationRules.MVP_READ_ROLES)
    public List<SiteResponse> listSites() {
        UUID tenantId = currentAccessContext.currentTenantId();
        return siteRepository.findByTenantId(tenantId).stream()
                .map(this::toSiteResponse)
                .toList();
    }

    @Transactional
    @PreAuthorize(AuthorizationRules.MVP_MANAGE_ROLES)
    public SiteResponse createSite(SaveSiteRequest request) {
        UUID tenantId = currentAccessContext.currentTenantId();
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found: " + tenantId));

        Site site = new Site();
        site.setTenant(tenant);
        applySiteFields(site, request);
        return toSiteResponse(siteRepository.save(site));
    }

    @Transactional
    @PreAuthorize(AuthorizationRules.MVP_MANAGE_ROLES)
    public SiteResponse updateSite(UUID siteId, SaveSiteRequest request) {
        UUID tenantId = currentAccessContext.currentTenantId();
        Site site = resolveSite(siteId, tenantId);
        applySiteFields(site, request);
        return toSiteResponse(siteRepository.save(site));
    }

    @Transactional
    @PreAuthorize(AuthorizationRules.MVP_READ_ROLES)
    public List<LocationResponse> listLocations(UUID siteId) {
        UUID tenantId = currentAccessContext.currentTenantId();
        resolveSite(siteId, tenantId);
        return locationRepository.findBySite_IdAndSite_Tenant_Id(siteId, tenantId).stream()
                .map(this::toLocationResponse)
                .toList();
    }

    @Transactional
    @PreAuthorize(AuthorizationRules.MVP_MANAGE_ROLES)
    public LocationResponse createLocation(UUID siteId, SaveLocationRequest request) {
        UUID tenantId = currentAccessContext.currentTenantId();
        Site site = resolveSite(siteId, tenantId);

        Location location = new Location();
        location.setSite(site);
        applyLocationFields(location, request, site, tenantId);
        return toLocationResponse(locationRepository.save(location));
    }

    @Transactional
    @PreAuthorize(AuthorizationRules.MVP_MANAGE_ROLES)
    public LocationResponse updateLocation(UUID siteId, UUID locationId, SaveLocationRequest request) {
        UUID tenantId = currentAccessContext.currentTenantId();
        Site site = resolveSite(siteId, tenantId);
        Location location = locationRepository.findByIdAndSite_Tenant_Id(locationId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found: " + locationId));

        if (!location.getSite().getId().equals(siteId)) {
            throw new ResourceNotFoundException("Location not found in site: " + locationId);
        }

        applyLocationFields(location, request, site, tenantId);
        return toLocationResponse(locationRepository.save(location));
    }

    private void applySiteFields(Site site, SaveSiteRequest request) {
        site.setName(request.getName().trim());
        site.setTimezone(request.getTimezone().trim());
    }

    private void applyLocationFields(Location location, SaveLocationRequest request, Site site, UUID tenantId) {
        location.setName(request.getName().trim());
        location.setType(request.getType());
        location.setParent(resolveParentLocation(request.getParentId(), site, tenantId, location.getId()));
    }

    private Location resolveParentLocation(UUID parentId, Site site, UUID tenantId, UUID currentLocationId) {
        if (parentId == null) {
            return null;
        }

        Location parent = locationRepository.findByIdAndSite_Tenant_Id(parentId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Parent location not found: " + parentId));

        if (!parent.getSite().getId().equals(site.getId())) {
            throw new BadRequestException("Parent location must belong to the same site.");
        }

        if (currentLocationId != null && currentLocationId.equals(parentId)) {
            throw new BadRequestException("Location cannot be its own parent.");
        }

        return parent;
    }

    private Site resolveSite(UUID siteId, UUID tenantId) {
        return siteRepository.findByIdAndTenant_Id(siteId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Site not found: " + siteId));
    }

    private SiteResponse toSiteResponse(Site site) {
        SiteResponse response = new SiteResponse();
        response.setId(site.getId());
        response.setTenantId(site.getTenant().getId());
        response.setName(site.getName());
        response.setTimezone(site.getTimezone());
        response.setCreatedAt(site.getCreatedAt());
        response.setUpdatedAt(site.getUpdatedAt());
        return response;
    }

    private LocationResponse toLocationResponse(Location location) {
        LocationResponse response = new LocationResponse();
        response.setId(location.getId());
        response.setSiteId(location.getSite().getId());
        response.setParentId(location.getParent() != null ? location.getParent().getId() : null);
        response.setName(location.getName());
        response.setType(location.getType());
        response.setCreatedAt(location.getCreatedAt());
        response.setUpdatedAt(location.getUpdatedAt());
        return response;
    }
}
