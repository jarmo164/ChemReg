package com.chemreg.chemreg.risk.entity;

import com.chemreg.chemreg.common.enums.RiskLevel;
import com.chemreg.chemreg.common.enums.RiskRatingType;
import com.chemreg.chemreg.common.persistence.entity.BaseCreatedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "risk_ratings")
public class RiskRating extends BaseCreatedEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "assessment_id", nullable = false)
    private RiskAssessment assessment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scenario_id")
    private ExposureScenario scenario;

    @Enumerated(EnumType.STRING)
    @Column(name = "rating_type", nullable = false, length = 20)
    private RiskRatingType ratingType;

    @Column(name = "likelihood", nullable = false)
    private Integer likelihood;

    @Column(name = "consequence", nullable = false)
    private Integer consequence;

    @Column(name = "score", nullable = false)
    private Integer score;

    @Enumerated(EnumType.STRING)
    @Column(name = "level", nullable = false, length = 20)
    private RiskLevel level;

    public RiskAssessment getAssessment() {
        return assessment;
    }

    public void setAssessment(RiskAssessment assessment) {
        this.assessment = assessment;
    }

    public ExposureScenario getScenario() {
        return scenario;
    }

    public void setScenario(ExposureScenario scenario) {
        this.scenario = scenario;
    }

    public RiskRatingType getRatingType() {
        return ratingType;
    }

    public void setRatingType(RiskRatingType ratingType) {
        this.ratingType = ratingType;
    }

    public Integer getLikelihood() {
        return likelihood;
    }

    public void setLikelihood(Integer likelihood) {
        this.likelihood = likelihood;
    }

    public Integer getConsequence() {
        return consequence;
    }

    public void setConsequence(Integer consequence) {
        this.consequence = consequence;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public RiskLevel getLevel() {
        return level;
    }

    public void setLevel(RiskLevel level) {
        this.level = level;
    }
}
