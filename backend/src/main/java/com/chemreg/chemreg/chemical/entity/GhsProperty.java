package com.chemreg.chemreg.chemical.entity;

import com.chemreg.chemreg.common.enums.GhsPictogramCode;
import com.chemreg.chemreg.common.persistence.entity.BaseUuidEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "ghs_properties")
public class GhsProperty extends BaseUuidEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private ChemicalProduct product;

    @Enumerated(EnumType.STRING)
    @Column(name = "pictogram_code", nullable = false, length = 10)
    private GhsPictogramCode pictogramCode;

    @Column(name = "h_class", length = 255)
    private String hClass;

    public ChemicalProduct getProduct() {
        return product;
    }

    public void setProduct(ChemicalProduct product) {
        this.product = product;
    }

    public GhsPictogramCode getPictogramCode() {
        return pictogramCode;
    }

    public void setPictogramCode(GhsPictogramCode pictogramCode) {
        this.pictogramCode = pictogramCode;
    }

    public String getHClass() {
        return hClass;
    }

    public void setHClass(String hClass) {
        this.hClass = hClass;
    }
}
