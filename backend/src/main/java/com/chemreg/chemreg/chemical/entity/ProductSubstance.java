package com.chemreg.chemreg.chemical.entity;

import com.chemreg.chemreg.common.persistence.entity.BaseUuidEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "product_substances")
public class ProductSubstance extends BaseUuidEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private ChemicalProduct product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "substance_id")
    private Substance substance;

    @Column(name = "substance_name_raw", length = 255)
    private String substanceNameRaw;

    @Column(name = "concentration_min", precision = 5, scale = 2)
    private BigDecimal concentrationMin;

    @Column(name = "concentration_max", precision = 5, scale = 2)
    private BigDecimal concentrationMax;

    public ChemicalProduct getProduct() {
        return product;
    }

    public void setProduct(ChemicalProduct product) {
        this.product = product;
    }

    public Substance getSubstance() {
        return substance;
    }

    public void setSubstance(Substance substance) {
        this.substance = substance;
    }

    public String getSubstanceNameRaw() {
        return substanceNameRaw;
    }

    public void setSubstanceNameRaw(String substanceNameRaw) {
        this.substanceNameRaw = substanceNameRaw;
    }

    public BigDecimal getConcentrationMin() {
        return concentrationMin;
    }

    public void setConcentrationMin(BigDecimal concentrationMin) {
        this.concentrationMin = concentrationMin;
    }

    public BigDecimal getConcentrationMax() {
        return concentrationMax;
    }

    public void setConcentrationMax(BigDecimal concentrationMax) {
        this.concentrationMax = concentrationMax;
    }
}
