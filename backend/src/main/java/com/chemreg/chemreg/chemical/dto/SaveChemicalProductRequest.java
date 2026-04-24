package com.chemreg.chemreg.chemical.dto;

import com.chemreg.chemreg.common.enums.ChemicalSignalWord;
import com.chemreg.chemreg.common.enums.InventoryUnit;
import com.chemreg.chemreg.common.enums.PhysicalState;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public class SaveChemicalProductRequest {

    @NotBlank
    @Size(max = 255)
    private String name;

    @Size(max = 50)
    private String casNumber;

    @Size(max = 50)
    private String ecNumber;

    @Size(max = 100)
    private String productCode;

    @Size(max = 255)
    private String supplierName;

    private ChemicalSignalWord signalWord;

    private PhysicalState physicalState;

    private InventoryUnit defaultUnit;

    @Size(max = 100)
    private String storageClass;

    @Size(max = 500)
    private String useDescription;

    private Boolean restricted;

    private UUID sdsDocumentId;

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

    public UUID getSdsDocumentId() {
        return sdsDocumentId;
    }

    public void setSdsDocumentId(UUID sdsDocumentId) {
        this.sdsDocumentId = sdsDocumentId;
    }
}
