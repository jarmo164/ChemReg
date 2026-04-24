package com.chemreg.chemreg.sds.dto;

import com.chemreg.chemreg.common.enums.SdsDocumentStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class SaveSdsDocumentRequest {

    @Valid
    @NotNull
    private DocumentPayload document;

    @NotNull
    private List<UUID> supplierIds = new ArrayList<>();

    @Valid
    @NotEmpty
    private List<SectionPayload> sections = new ArrayList<>();

    public DocumentPayload getDocument() {
        return document;
    }

    public void setDocument(DocumentPayload document) {
        this.document = document;
    }

    public List<UUID> getSupplierIds() {
        return supplierIds;
    }

    public void setSupplierIds(List<UUID> supplierIds) {
        this.supplierIds = supplierIds;
    }

    public List<SectionPayload> getSections() {
        return sections;
    }

    public void setSections(List<SectionPayload> sections) {
        this.sections = sections;
    }

    public static class DocumentPayload {

        @NotBlank
        @Size(max = 255)
        private String productName;

        @Size(max = 255)
        private String supplierNameRaw;

        @NotBlank
        @Size(max = 10)
        private String language;

        @NotBlank
        @Size(max = 10)
        private String countryFormat;

        private String revisionDate;

        private String expiryDate;

        @NotNull
        private SdsDocumentStatus status;

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
    }

    public static class SectionPayload {

        @NotNull
        private Integer sectionNumber;

        @NotBlank
        @Size(max = 255)
        private String title;

        @NotBlank
        private String content;

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
    }
}
