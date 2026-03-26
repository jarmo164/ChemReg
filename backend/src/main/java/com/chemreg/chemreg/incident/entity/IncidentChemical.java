package com.chemreg.chemreg.incident.entity;

import com.chemreg.chemreg.chemical.entity.ChemicalProduct;
import com.chemreg.chemreg.common.persistence.entity.BaseUuidEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "incident_chemicals")
public class IncidentChemical extends BaseUuidEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "incident_id", nullable = false)
    private Incident incident;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private ChemicalProduct product;

    public Incident getIncident() {
        return incident;
    }

    public void setIncident(Incident incident) {
        this.incident = incident;
    }

    public ChemicalProduct getProduct() {
        return product;
    }

    public void setProduct(ChemicalProduct product) {
        this.product = product;
    }
}
