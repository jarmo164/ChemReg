package com.chemreg.chemreg.sds.service;

import com.chemreg.chemreg.common.exception.BadRequestException;
import com.chemreg.chemreg.common.exception.ResourceNotFoundException;
import com.chemreg.chemreg.common.security.AuthorizationRules;
import com.chemreg.chemreg.common.security.CurrentAccessContext;
import com.chemreg.chemreg.sds.dto.SdsFileResponse;
import com.chemreg.chemreg.sds.entity.SdsDocument;
import com.chemreg.chemreg.sds.entity.SdsFile;
import com.chemreg.chemreg.sds.repository.SdsDocumentRepository;
import com.chemreg.chemreg.sds.repository.SdsFileRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
public class SdsFileService {

    private final SdsDocumentRepository sdsDocumentRepository;
    private final SdsFileRepository sdsFileRepository;
    private final SdsBinaryStorage sdsBinaryStorage;
    private final CurrentAccessContext currentAccessContext;

    public SdsFileService(
            SdsDocumentRepository sdsDocumentRepository,
            SdsFileRepository sdsFileRepository,
            SdsBinaryStorage sdsBinaryStorage,
            CurrentAccessContext currentAccessContext
    ) {
        this.sdsDocumentRepository = sdsDocumentRepository;
        this.sdsFileRepository = sdsFileRepository;
        this.sdsBinaryStorage = sdsBinaryStorage;
        this.currentAccessContext = currentAccessContext;
    }

    @Transactional
    @PreAuthorize(AuthorizationRules.SDS_AUTHOR_ROLES)
    public SdsFileResponse upload(UUID documentId, MultipartFile file) {
        SdsDocument document = requireDocumentForCurrentTenant(documentId);
        validateUpload(file);

        try {
            List<SdsFile> existingFiles = sdsFileRepository.findBySdsDocumentIdOrderByCreatedAtDesc(documentId);
            for (SdsFile existingFile : existingFiles) {
                if (Boolean.TRUE.equals(existingFile.getCurrent())) {
                    existingFile.setCurrent(Boolean.FALSE);
                }
            }
            if (!existingFiles.isEmpty()) {
                sdsFileRepository.saveAll(existingFiles);
            }

            UUID storageFileId = UUID.randomUUID();
            String storageKey = sdsBinaryStorage.store(documentId, storageFileId, file.getOriginalFilename(), file.getBytes());

            SdsFile sdsFile = new SdsFile();
            sdsFile.setSdsDocument(document);
            sdsFile.setCurrent(Boolean.TRUE);
            sdsFile.setFileSizeBytes(Math.toIntExact(file.getSize()));
            sdsFile.setExtractedText(null);
            sdsFile.setS3Key(storageKey);
            return toResponse(sdsFileRepository.save(sdsFile));
        } catch (IOException exception) {
            throw new BadRequestException("SDS file upload failed: " + exception.getMessage());
        }
    }

    @Transactional
    @PreAuthorize(AuthorizationRules.MVP_READ_ROLES)
    public StoredSdsFile load(UUID documentId, UUID fileId) {
        requireDocumentForCurrentTenant(documentId);
        SdsFile sdsFile = sdsFileRepository.findByIdAndSdsDocumentId(fileId, documentId)
                .orElseThrow(() -> new ResourceNotFoundException("SDS file not found: " + fileId));

        try {
            byte[] content = sdsBinaryStorage.read(sdsFile.getS3Key());
            return new StoredSdsFile(
                    toResponse(sdsFile),
                    content,
                    detectContentType(sdsFile.getS3Key())
            );
        } catch (IOException exception) {
            throw new ResourceNotFoundException("Stored SDS binary not found for file: " + fileId);
        }
    }

    private void validateUpload(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded SDS file must not be empty.");
        }

        if (file.getSize() > Integer.MAX_VALUE) {
            throw new BadRequestException("Uploaded SDS file is too large for MVP storage handling.");
        }
    }

    private SdsDocument requireDocumentForCurrentTenant(UUID id) {
        UUID tenantId = currentAccessContext.currentTenantId();
        return sdsDocumentRepository.findByIdAndTenant_Id(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("SDS document not found: " + id));
    }

    private String detectContentType(String storageKey) {
        String normalized = storageKey.toLowerCase();
        if (normalized.endsWith(".pdf")) {
            return "application/pdf";
        }
        if (normalized.endsWith(".txt")) {
            return "text/plain";
        }
        return "application/octet-stream";
    }

    public SdsFileResponse toResponse(SdsFile sdsFile) {
        SdsFileResponse response = new SdsFileResponse();
        response.setId(sdsFile.getId());
        response.setStorageKey(sdsFile.getS3Key());
        response.setFilename(extractFilename(sdsFile.getS3Key()));
        response.setFileSizeBytes(sdsFile.getFileSizeBytes());
        response.setExtractedText(sdsFile.getExtractedText());
        response.setCurrent(sdsFile.getCurrent());
        response.setCreatedAt(sdsFile.getCreatedAt());
        return response;
    }

    private String extractFilename(String storageKey) {
        if (storageKey == null || storageKey.isBlank()) {
            return "unknown";
        }

        int separatorIndex = storageKey.lastIndexOf('/');
        return separatorIndex >= 0 ? storageKey.substring(separatorIndex + 1) : storageKey;
    }

    public record StoredSdsFile(SdsFileResponse file, byte[] content, String contentType) {
    }
}
