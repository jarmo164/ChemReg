package com.chemreg.chemreg.risk.entity;

import com.chemreg.chemreg.common.enums.ExposureScenarioType;
import com.chemreg.chemreg.common.persistence.entity.BaseCreatedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "exposure_scenarios")
public class ExposureScenario extends BaseCreatedEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "assessment_id", nullable = false)
    private RiskAssessment assessment;

    @Enumerated(EnumType.STRING)
    @Column(name = "scenario_type", nullable = false, length = 100)
    private ExposureScenarioType scenarioType;

    @Column(name = "description")
    private String description;

    @Column(name = "frequency", length = 100)
    private String frequency;

    @Column(name = "duration", length = 100)
    private String duration;

    @Column(name = "ventilation", length = 100)
    private String ventilation;

    @OneToMany(mappedBy = "scenario")
    private Set<ControlMeasure> controlMeasures = new LinkedHashSet<>();

    public RiskAssessment getAssessment() {
        return assessment;
    }

    public void setAssessment(RiskAssessment assessment) {
        this.assessment = assessment;
    }

    public ExposureScenarioType getScenarioType() {
        return scenarioType;
    }

    public void setScenarioType(ExposureScenarioType scenarioType) {
        this.scenarioType = scenarioType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getFrequency() {
        return frequency;
    }

    public void setFrequency(String frequency) {
        this.frequency = frequency;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public String getVentilation() {
        return ventilation;
    }

    public void setVentilation(String ventilation) {
        this.ventilation = ventilation;
    }

    public Set<ControlMeasure> getControlMeasures() {
        return controlMeasures;
    }

    public void setControlMeasures(Set<ControlMeasure> controlMeasures) {
        this.controlMeasures = controlMeasures;
    }
}
