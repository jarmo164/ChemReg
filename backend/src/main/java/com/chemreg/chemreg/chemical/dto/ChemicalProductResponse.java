package com.chemreg.chemreg.chemical.dto;

import com.chemreg.chemreg.common.enums.ChemicalSignalWord;
import com.chemreg.chemreg.common.enums.InventoryUnit;
import com.chemreg.chemreg.common.enums.PhysicalState;

import java.time.OffsetDateTime;
import java.util.UUID;

public class ChemicalProductResponse {

    private UUID id;
    /** Present for API clarity; will come from security context once multi-tenant auth is wired. */
    private UUID tenantId;
    /** Always null until SDS linking is implemented for this API. */
    private UUID sdsDocumentId;
    private String name;
    private String casNumber;
    private String ecNumber;
    private String productCode;
    private String supplierName;
    private ChemicalSignalWord signalWord;
    private PhysicalState physicalState;
    private InventoryUnit defaultUnit;
    private String storageClass;
    private String useDescription;
    private Boolean restricted;
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

    public UUID getSdsDocumentId() {
        return sdsDocumentId;
    }

    public void setSdsDocumentId(UUID sdsDocumentId) {
        this.sdsDocumentId = sdsDocumentId;
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

    public String getProductCode() {
        return productCode;
    }

    public void setProductCode(String productCode) {
        this.productCode = productCode;
    }

    public String getSupplierName() {
        return supplierName;
    }

    public void setSupplierName(String supplierName) {
        this.supplierName = supplierName;
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

    public InventoryUnit getDefaultUnit() {
        return defaultUnit;
    }

    public void setDefaultUnit(InventoryUnit defaultUnit) {
        this.defaultUnit = defaultUnit;
    }

    public String getStorageClass() {
        return storageClass;
    }

    public void setStorageClass(String storageClass) {
        this.storageClass = storageClass;
    }

    public String getUseDescription() {
        return useDescription;
    }

    public void setUseDescription(String useDescription) {
        this.useDescription = useDescription;
    }

    public Boolean getRestricted() {
        return restricted;
    }

    public void setRestricted(Boolean restricted) {
        this.restricted = restricted;
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
}
