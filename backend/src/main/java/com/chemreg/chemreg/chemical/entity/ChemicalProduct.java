package com.chemreg.chemreg.chemical.entity;

import com.chemreg.chemreg.common.enums.ChemicalSignalWord;
import com.chemreg.chemreg.common.enums.PhysicalState;
import com.chemreg.chemreg.common.persistence.entity.BaseAuditableEntity;
import com.chemreg.chemreg.sds.entity.SdsDocument;
import com.chemreg.chemreg.tenant.entity.Tenant;
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
@Table(name = "chemical_products")
public class ChemicalProduct extends BaseAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sds_id")
    private SdsDocument sdsDocument;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "cas_number", length = 50)
    private String casNumber;

    @Column(name = "ec_number", length = 50)
    private String ecNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "signal_word", length = 50)
    private ChemicalSignalWord signalWord;

    @Enumerated(EnumType.STRING)
    @Column(name = "physical_state", length = 50)
    private PhysicalState physicalState;

    @Column(name = "is_restricted", nullable = false)
    private Boolean restricted;

    @OneToMany(mappedBy = "product")
    private Set<GhsProperty> ghsProperties = new LinkedHashSet<>();

    @OneToMany(mappedBy = "product")
    private Set<ProductSubstance> productSubstances = new LinkedHashSet<>();

    public Tenant getTenant() {
        return tenant;
    }

    public void setTenant(Tenant tenant) {
        this.tenant = tenant;
    }

    public SdsDocument getSdsDocument() {
        return sdsDocument;
    }

    public void setSdsDocument(SdsDocument sdsDocument) {
        this.sdsDocument = sdsDocument;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCasNumber() {
        return casNumber;
    }

    public void setCasNumber(String casNumber) {
        this.casNumber = casNumber;
    }

    public String getEcNumber() {
        return ecNumber;
    }

    public void setEcNumber(String ecNumber) {
        this.ecNumber = ecNumber;
    }

    public ChemicalSignalWord getSignalWord() {
        return signalWord;
    }

    public void setSignalWord(ChemicalSignalWord signalWord) {
        this.signalWord = signalWord;
    }

    public PhysicalState getPhysicalState() {
        return physicalState;
    }

    public void setPhysicalState(PhysicalState physicalState) {
        this.physicalState = physicalState;
    }

    public Boolean getRestricted() {
        return restricted;
    }

    public void setRestricted(Boolean restricted) {
        this.restricted = restricted;
    }

    public Set<GhsProperty> getGhsProperties() {
        return ghsProperties;
    }

    public void setGhsProperties(Set<GhsProperty> ghsProperties) {
        this.ghsProperties = ghsProperties;
    }

    public Set<ProductSubstance> getProductSubstances() {
        return productSubstances;
    }

    public void setProductSubstances(Set<ProductSubstance> productSubstances) {
        this.productSubstances = productSubstances;
    }
}
