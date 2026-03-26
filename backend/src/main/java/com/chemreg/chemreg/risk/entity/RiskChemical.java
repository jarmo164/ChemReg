package com.chemreg.chemreg.risk.entity;

import com.chemreg.chemreg.chemical.entity.ChemicalProduct;
import com.chemreg.chemreg.common.enums.InventoryUnit;
import com.chemreg.chemreg.common.persistence.entity.BaseUuidEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "risk_chemicals")
public class RiskChemical extends BaseUuidEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "assessment_id", nullable = false)
    private RiskAssessment assessment;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private ChemicalProduct product;

    @Column(name = "quantity", precision = 10, scale = 3)
    private BigDecimal quantity;

    @Enumerated(EnumType.STRING)
    @Column(name = "unit", length = 20)
    private InventoryUnit unit;

    public RiskAssessment getAssessment() {
        return assessment;
    }

    public void setAssessment(RiskAssessment assessment) {
        this.assessment = assessment;
    }

    public ChemicalProduct getProduct() {
        return product;
    }

    public void setProduct(ChemicalProduct product) {
        this.product = product;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public InventoryUnit getUnit() {
        return unit;
    }

    public void setUnit(InventoryUnit unit) {
        this.unit = unit;
    }
}
