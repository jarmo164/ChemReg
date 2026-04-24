package com.chemreg.chemreg.sds.controller;

import com.chemreg.chemreg.sds.dto.SaveSdsDocumentRequest;
import com.chemreg.chemreg.sds.dto.SdsDocumentResponse;
import com.chemreg.chemreg.sds.dto.SdsFileResponse;
import com.chemreg.chemreg.sds.service.SdsDocumentService;
import com.chemreg.chemreg.sds.service.SdsFileService;
import jakarta.validation.Valid;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/sds-documents")
public class SdsDocumentController {

    private final SdsDocumentService sdsDocumentService;
    private final SdsFileService sdsFileService;

    public SdsDocumentController(SdsDocumentService sdsDocumentService, SdsFileService sdsFileService) {
        this.sdsDocumentService = sdsDocumentService;
        this.sdsFileService = sdsFileService;
    }

    @GetMapping
    public ResponseEntity<List<SdsDocumentResponse>> list() {
        return ResponseEntity.ok(sdsDocumentService.listAllForCurrentTenant());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SdsDocumentResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(sdsDocumentService.getById(id));
    }

    @PostMapping
    public ResponseEntity<SdsDocumentResponse> create(@Valid @RequestBody SaveSdsDocumentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sdsDocumentService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SdsDocumentResponse> update(@PathVariable UUID id, @Valid @RequestBody SaveSdsDocumentRequest request) {
        return ResponseEntity.ok(sdsDocumentService.update(id, request));
    }

    @PostMapping(path = "/{id}/files", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SdsFileResponse> uploadFile(@PathVariable UUID id, @RequestParam("file") MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sdsFileService.upload(id, file));
    }

    @GetMapping("/{documentId}/files/{fileId}/download")
    public ResponseEntity<ByteArrayResource> downloadFile(@PathVariable UUID documentId, @PathVariable UUID fileId) {
        return buildBinaryResponse(documentId, fileId, false);
    }

    @GetMapping("/{documentId}/files/{fileId}/preview")
    public ResponseEntity<ByteArrayResource> previewFile(@PathVariable UUID documentId, @PathVariable UUID fileId) {
        return buildBinaryResponse(documentId, fileId, true);
    }

    private ResponseEntity<ByteArrayResource> buildBinaryResponse(UUID documentId, UUID fileId, boolean inline) {
        SdsFileService.StoredSdsFile storedFile = sdsFileService.load(documentId, fileId);
        ContentDisposition disposition = (inline ? ContentDisposition.inline() : ContentDisposition.attachment())
                .filename(storedFile.file().getFilename())
                .build();

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(storedFile.contentType()))
                .contentLength(storedFile.content().length)
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .body(new ByteArrayResource(storedFile.content()));
    }
}
