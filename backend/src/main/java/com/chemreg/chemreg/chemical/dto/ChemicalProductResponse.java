package com.chemreg.chemreg.chemical.dto;

import com.chemreg.chemreg.common.enums.ChemicalSignalWord;
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
    private ChemicalSignalWord signalWord;
    private PhysicalState physicalState;
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
