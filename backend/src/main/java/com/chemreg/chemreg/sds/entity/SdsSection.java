package com.chemreg.chemreg.sds.entity;

import com.chemreg.chemreg.common.persistence.entity.BaseCreatedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "sds_sections")
public class SdsSection extends BaseCreatedEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sds_id", nullable = false)
    private SdsDocument sdsDocument;

    @Column(name = "section_number", nullable = false)
    private Integer sectionNumber;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "content")
    private String content;

    public SdsDocument getSdsDocument() {
        return sdsDocument;
    }

    public void setSdsDocument(SdsDocument sdsDocument) {
        this.sdsDocument = sdsDocument;
    }

    public Integer getSectionNumber() {
        return sectionNumber;
    }

    public void setSectionNumber(Integer sectionNumber) {
        this.sectionNumber = sectionNumber;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
