package com.chemreg.chemreg.sds.entity;

import com.chemreg.chemreg.common.enums.SdsDocumentStatus;
import com.chemreg.chemreg.common.persistence.entity.BaseAuditableEntity;
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

import java.time.LocalDate;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "sds_documents")
public class SdsDocument extends BaseAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(name = "product_name", nullable = false, length = 255)
    private String productName;

    @Column(name = "supplier_name_raw", length = 255)
    private String supplierNameRaw;

    @Column(name = "language", nullable = false, length = 10)
    private String language;

    @Column(name = "country_format", nullable = false, length = 10)
    private String countryFormat;

    @Column(name = "revision_date")
    private LocalDate revisionDate;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private SdsDocumentStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @OneToMany(mappedBy = "sdsDocument")
    private Set<SdsFile> files = new LinkedHashSet<>();

    @OneToMany(mappedBy = "sdsDocument")
    private Set<SdsSection> sections = new LinkedHashSet<>();

    @OneToMany(mappedBy = "sdsDocument")
    private Set<SdsSupplierLink> supplierLinks = new LinkedHashSet<>();

    public Tenant getTenant() {
        return tenant;
    }

    public void setTenant(Tenant tenant) {
        this.tenant = tenant;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getSupplierNameRaw() {
        return supplierNameRaw;
    }

    public void setSupplierNameRaw(String supplierNameRaw) {
        this.supplierNameRaw = supplierNameRaw;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getCountryFormat() {
        return countryFormat;
    }

    public void setCountryFormat(String countryFormat) {
        this.countryFormat = countryFormat;
    }

    public LocalDate getRevisionDate() {
        return revisionDate;
    }

    public void setRevisionDate(LocalDate revisionDate) {
        this.revisionDate = revisionDate;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public SdsDocumentStatus getStatus() {
        return status;
    }

    public void setStatus(SdsDocumentStatus status) {
        this.status = status;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public Set<SdsFile> getFiles() {
        return files;
    }

    public void setFiles(Set<SdsFile> files) {
        this.files = files;
    }

    public Set<SdsSection> getSections() {
        return sections;
    }

    public void setSections(Set<SdsSection> sections) {
        this.sections = sections;
    }

    public Set<SdsSupplierLink> getSupplierLinks() {
        return supplierLinks;
    }

    public void setSupplierLinks(Set<SdsSupplierLink> supplierLinks) {
        this.supplierLinks = supplierLinks;
    }
}
