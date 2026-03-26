package com.chemreg.chemreg.sds.entity;

import com.chemreg.chemreg.common.persistence.entity.BaseCreatedEntity;
import com.chemreg.chemreg.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "sds_files")
public class SdsFile extends BaseCreatedEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sds_id", nullable = false)
    private SdsDocument sdsDocument;

    @Column(name = "s3_key", nullable = false, length = 500)
    private String s3Key;

    @Column(name = "file_size_bytes")
    private Integer fileSizeBytes;

    @Column(name = "extracted_text")
    private String extractedText;

    @Column(name = "is_current", nullable = false)
    private Boolean current;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;

    public SdsDocument getSdsDocument() {
        return sdsDocument;
    }

    public void setSdsDocument(SdsDocument sdsDocument) {
        this.sdsDocument = sdsDocument;
    }

    public String getS3Key() {
        return s3Key;
    }

    public void setS3Key(String s3Key) {
        this.s3Key = s3Key;
    }

    public Integer getFileSizeBytes() {
        return fileSizeBytes;
    }

    public void setFileSizeBytes(Integer fileSizeBytes) {
        this.fileSizeBytes = fileSizeBytes;
    }

    public String getExtractedText() {
        return extractedText;
    }

    public void setExtractedText(String extractedText) {
        this.extractedText = extractedText;
    }

    public Boolean getCurrent() {
        return current;
    }

    public void setCurrent(Boolean current) {
        this.current = current;
    }

    public User getUploadedBy() {
        return uploadedBy;
    }

    public void setUploadedBy(User uploadedBy) {
        this.uploadedBy = uploadedBy;
    }
}
