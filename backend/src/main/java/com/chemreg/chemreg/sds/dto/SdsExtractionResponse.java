package com.chemreg.chemreg.sds.dto;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class SdsExtractionResponse {

    private UUID documentId;
    private UUID fileId;
    private String filename;
    private String status;
    private List<String> warnings = new ArrayList<>();
    private SaveSdsDocumentRequest draft;

    public UUID getDocumentId() {
        return documentId;
    }

    public void setDocumentId(UUID documentId) {
        this.documentId = documentId;
    }

    public UUID getFileId() {
        return fileId;
    }

    public void setFileId(UUID fileId) {
        this.fileId = fileId;
    }

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<String> getWarnings() {
        return warnings;
    }

    public void setWarnings(List<String> warnings) {
        this.warnings = warnings;
    }

    public SaveSdsDocumentRequest getDraft() {
        return draft;
    }

    public void setDraft(SaveSdsDocumentRequest draft) {
        this.draft = draft;
    }
}
