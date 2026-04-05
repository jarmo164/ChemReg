package com.chemreg.chemreg.chemical.dto;

import com.chemreg.chemreg.common.enums.ChemicalSignalWord;
import com.chemreg.chemreg.common.enums.PhysicalState;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SaveChemicalProductRequest {

    @NotBlank
    @Size(max = 255)
    private String name;

    @Size(max = 50)
    private String casNumber;

    @Size(max = 50)
    private String ecNumber;

    private ChemicalSignalWord signalWord;

    private PhysicalState physicalState;

    private Boolean restricted;

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
}
