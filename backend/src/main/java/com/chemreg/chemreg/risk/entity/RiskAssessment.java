package com.chemreg.chemreg.risk.entity;

import com.chemreg.chemreg.common.enums.RiskAssessmentStatus;
import com.chemreg.chemreg.common.persistence.entity.BaseAuditableEntity;
import com.chemreg.chemreg.site.entity.Location;
import com.chemreg.chemreg.tenant.entity.Tenant;
import com.chemreg.chemreg.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "risk_assessments")
public class RiskAssessment extends BaseAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id")
    private Location location;

    @Column(name = "description")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private RiskAssessmentStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id")
    private RiskAssessmentTemplate template;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @OneToMany(mappedBy = "assessment")
    private Set<RiskChemical> riskChemicals = new LinkedHashSet<>();

    @OneToMany(mappedBy = "assessment")
    private Set<ExposureScenario> exposureScenarios = new LinkedHashSet<>();

    @OneToMany(mappedBy = "assessment")
    private Set<RiskRating> riskRatings = new LinkedHashSet<>();

    public Tenant getTenant() {
        return tenant;
    }

    public void setTenant(Tenant tenant) {
        this.tenant = tenant;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Location getLocation() {
        return location;
    }

    public void setLocation(Location location) {
        this.location = location;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public RiskAssessmentStatus getStatus() {
        return status;
    }

    public void setStatus(RiskAssessmentStatus status) {
        this.status = status;
    }

    public RiskAssessmentTemplate getTemplate() {
        return template;
    }

    public void setTemplate(RiskAssessmentTemplate template) {
        this.template = template;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public Set<RiskChemical> getRiskChemicals() {
        return riskChemicals;
    }

    public void setRiskChemicals(Set<RiskChemical> riskChemicals) {
        this.riskChemicals = riskChemicals;
    }

    public Set<ExposureScenario> getExposureScenarios() {
        return exposureScenarios;
    }

    public void setExposureScenarios(Set<ExposureScenario> exposureScenarios) {
        this.exposureScenarios = exposureScenarios;
    }

    public Set<RiskRating> getRiskRatings() {
        return riskRatings;
    }

    public void setRiskRatings(Set<RiskRating> riskRatings) {
        this.riskRatings = riskRatings;
    }
}
