package com.chemreg.chemreg.risk.entity;

import com.chemreg.chemreg.common.enums.ControlMeasureType;
import com.chemreg.chemreg.common.persistence.entity.BaseAuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "control_measures")
public class ControlMeasure extends BaseAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "scenario_id", nullable = false)
    private ExposureScenario scenario;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 50)
    private ControlMeasureType type;

    @Column(name = "description", nullable = false, length = 500)
    private String description;

    @Column(name = "is_implemented", nullable = false)
    private Boolean implemented;

    public ExposureScenario getScenario() {
        return scenario;
    }

    public void setScenario(ExposureScenario scenario) {
        this.scenario = scenario;
    }

    public ControlMeasureType getType() {
        return type;
    }

    public void setType(ControlMeasureType type) {
        this.type = type;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getImplemented() {
        return implemented;
    }

    public void setImplemented(Boolean implemented) {
        this.implemented = implemented;
    }
}
