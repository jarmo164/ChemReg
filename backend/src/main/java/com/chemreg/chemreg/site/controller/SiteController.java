package com.chemreg.chemreg.site.controller;

import com.chemreg.chemreg.site.dto.SaveLocationRequest;
import com.chemreg.chemreg.site.dto.SaveSiteRequest;
import com.chemreg.chemreg.site.dto.LocationResponse;
import com.chemreg.chemreg.site.dto.SiteResponse;
import com.chemreg.chemreg.site.service.SiteLocationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/sites")
public class SiteController {

    private final SiteLocationService siteLocationService;

    public SiteController(SiteLocationService siteLocationService) {
        this.siteLocationService = siteLocationService;
    }

    @GetMapping
    public ResponseEntity<List<SiteResponse>> listSites() {
        return ResponseEntity.ok(siteLocationService.listSites());
    }

    @PostMapping
    public ResponseEntity<SiteResponse> createSite(@Valid @RequestBody SaveSiteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(siteLocationService.createSite(request));
    }

    @PutMapping("/{siteId}")
    public ResponseEntity<SiteResponse> updateSite(@PathVariable UUID siteId, @Valid @RequestBody SaveSiteRequest request) {
        return ResponseEntity.ok(siteLocationService.updateSite(siteId, request));
    }

    @GetMapping("/{siteId}/locations")
    public ResponseEntity<List<LocationResponse>> listLocations(@PathVariable UUID siteId) {
        return ResponseEntity.ok(siteLocationService.listLocations(siteId));
    }

    @PostMapping("/{siteId}/locations")
    public ResponseEntity<LocationResponse> createLocation(@PathVariable UUID siteId, @Valid @RequestBody SaveLocationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(siteLocationService.createLocation(siteId, request));
    }

    @PutMapping("/{siteId}/locations/{locationId}")
    public ResponseEntity<LocationResponse> updateLocation(
            @PathVariable UUID siteId,
            @PathVariable UUID locationId,
            @Valid @RequestBody SaveLocationRequest request
    ) {
        return ResponseEntity.ok(siteLocationService.updateLocation(siteId, locationId, request));
    }
}
