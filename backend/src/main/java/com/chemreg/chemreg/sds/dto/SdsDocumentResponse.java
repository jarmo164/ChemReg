package com.chemreg.chemreg.sds.dto;

import com.chemreg.chemreg.common.enums.SdsDocumentStatus;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class SdsDocumentResponse {

    private UUID id;
    private UUID tenantId;
    private String productName;
    private String supplierNameRaw;
    private String language;
    private String countryFormat;
    private String revisionDate;
    private String expiryDate;
    private SdsDocumentStatus status;
    private List<UUID> supplierIds = new ArrayList<>();
    private List<SectionResponse> sections = new ArrayList<>();
    private List<SdsFileResponse> files = new ArrayList<>();
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getTenantId() {
        return tenantId;
    }

    public void setTenantId(UUID tenantId) {
        this.tenantId = tenantId;
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

    public String getRevisionDate() {
        return revisionDate;
    }

    public void setRevisionDate(String revisionDate) {
        this.revisionDate = revisionDate;
    }

    public String getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(String expiryDate) {
        this.expiryDate = expiryDate;
    }

    public SdsDocumentStatus getStatus() {
        return status;
    }

    public void setStatus(SdsDocumentStatus status) {
        this.status = status;
    }

    public List<UUID> getSupplierIds() {
        return supplierIds;
    }

    public void setSupplierIds(List<UUID> supplierIds) {
        this.supplierIds = supplierIds;
    }

    public List<SectionResponse> getSections() {
        return sections;
    }

    public void setSections(List<SectionResponse> sections) {
        this.sections = sections;
    }

    public List<SdsFileResponse> getFiles() {
        return files;
    }

    public void setFiles(List<SdsFileResponse> files) {
        this.files = files;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public static class SectionResponse {

        private UUID id;
        private Integer sectionNumber;
        private String title;
        private String content;
        private OffsetDateTime createdAt;

        public UUID getId() {
            return id;
        }

        public void setId(UUID id) {
            this.id = id;
        }

        public Integer getSectionNumber() {
            return sectionNumber;
        }

        public void setSectionNumber(Integer sectionNumber) {
            this.sectionNumber = sectionNumber;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }

        public OffsetDateTime getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(OffsetDateTime createdAt) {
            this.createdAt = createdAt;
        }
    }
}
