package com.chemreg.chemreg.sds.service;

import com.chemreg.chemreg.common.exception.BadRequestException;
import com.chemreg.chemreg.common.exception.ResourceNotFoundException;
import com.chemreg.chemreg.common.security.CurrentAccessContext;
import com.chemreg.chemreg.sds.entity.SdsDocument;
import com.chemreg.chemreg.sds.entity.SdsFile;
import com.chemreg.chemreg.sds.repository.SdsDocumentRepository;
import com.chemreg.chemreg.sds.repository.SdsFileRepository;
import com.chemreg.chemreg.tenant.entity.Tenant;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SdsFileServiceTest {

    @Mock
    private SdsDocumentRepository sdsDocumentRepository;
    @Mock
    private SdsFileRepository sdsFileRepository;
    @Mock
    private SdsBinaryStorage sdsBinaryStorage;
    @Mock
    private CurrentAccessContext currentAccessContext;

    private SdsFileService sdsFileService;

    @BeforeEach
    void setUp() {
        sdsFileService = new SdsFileService(
                sdsDocumentRepository,
                sdsFileRepository,
                sdsBinaryStorage,
                currentAccessContext
        );
    }

    @Test
    void uploadMarksPreviousCurrentFileAsNonCurrentAndStoresBinary() throws Exception {
        UUID tenantId = UUID.randomUUID();
        UUID documentId = UUID.randomUUID();
        UUID oldFileId = UUID.randomUUID();
        when(currentAccessContext.currentTenantId()).thenReturn(tenantId);
        when(sdsDocumentRepository.findByIdAndTenant_Id(documentId, tenantId)).thenReturn(Optional.of(document(documentId, tenantId)));

        SdsFile previous = file(oldFileId, documentId, true, "old/file.pdf");
        when(sdsFileRepository.findBySdsDocumentIdOrderByCreatedAtDesc(documentId)).thenReturn(List.of(previous));
        when(sdsFileRepository.save(any(SdsFile.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(sdsBinaryStorage.store(any(UUID.class), any(UUID.class), any(String.class), any(byte[].class)))
                .thenAnswer(invocation -> invocation.getArgument(0) + "/" + invocation.getArgument(1) + "-" + invocation.getArgument(2));

        MockMultipartFile multipartFile = new MockMultipartFile(
                "file",
                "sheet.pdf",
                "application/pdf",
                "pdf-content".getBytes()
        );

        sdsFileService.upload(documentId, multipartFile);

        assertEquals(Boolean.FALSE, previous.getCurrent());
        verify(sdsFileRepository).saveAll(List.of(previous));

        ArgumentCaptor<SdsFile> fileCaptor = ArgumentCaptor.forClass(SdsFile.class);
        verify(sdsFileRepository).save(fileCaptor.capture());
        SdsFile persistedWithStorageKey = fileCaptor.getValue();

        ArgumentCaptor<UUID> storageFileIdCaptor = ArgumentCaptor.forClass(UUID.class);
        verify(sdsBinaryStorage).store(
                org.mockito.ArgumentMatchers.eq(documentId),
                storageFileIdCaptor.capture(),
                org.mockito.ArgumentMatchers.eq("sheet.pdf"),
                org.mockito.ArgumentMatchers.eq("pdf-content".getBytes())
        );

        UUID storageFileId = storageFileIdCaptor.getValue();
        assertEquals(documentId + "/" + storageFileId + "-sheet.pdf", persistedWithStorageKey.getS3Key());
        assertEquals(Boolean.TRUE, persistedWithStorageKey.getCurrent());
        assertEquals(Integer.valueOf("pdf-content".getBytes().length), persistedWithStorageKey.getFileSizeBytes());
    }

    @Test
    void uploadRejectsEmptyFile() {
        UUID tenantId = UUID.randomUUID();
        UUID documentId = UUID.randomUUID();
        when(currentAccessContext.currentTenantId()).thenReturn(tenantId);
        when(sdsDocumentRepository.findByIdAndTenant_Id(documentId, tenantId)).thenReturn(Optional.of(document(documentId, tenantId)));

        MockMultipartFile multipartFile = new MockMultipartFile("file", "empty.pdf", "application/pdf", new byte[0]);

        assertThrows(BadRequestException.class, () -> sdsFileService.upload(documentId, multipartFile));
    }

    @Test
    void loadRejectsCrossTenantFileAccess() {
        UUID tenantId = UUID.randomUUID();
        UUID documentId = UUID.randomUUID();
        when(currentAccessContext.currentTenantId()).thenReturn(tenantId);
        when(sdsDocumentRepository.findByIdAndTenant_Id(documentId, tenantId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> sdsFileService.load(documentId, UUID.randomUUID()));
    }

    @Test
    void loadReturnsStoredContentAndMetadata() throws Exception {
        UUID tenantId = UUID.randomUUID();
        UUID documentId = UUID.randomUUID();
        UUID fileId = UUID.randomUUID();
        when(currentAccessContext.currentTenantId()).thenReturn(tenantId);
        when(sdsDocumentRepository.findByIdAndTenant_Id(documentId, tenantId)).thenReturn(Optional.of(document(documentId, tenantId)));
        when(sdsFileRepository.findByIdAndSdsDocumentId(fileId, documentId)).thenReturn(Optional.of(file(fileId, documentId, true, documentId + "/" + fileId + "-sheet.pdf")));
        when(sdsBinaryStorage.read(documentId + "/" + fileId + "-sheet.pdf")).thenReturn("pdf-content".getBytes());

        SdsFileService.StoredSdsFile loaded = sdsFileService.load(documentId, fileId);

        assertEquals("application/pdf", loaded.contentType());
        assertArrayEquals("pdf-content".getBytes(), loaded.content());
        assertEquals(fileId, loaded.file().getId());
    }

    private SdsDocument document(UUID documentId, UUID tenantId) {
        Tenant tenant = new Tenant();
        tenant.setId(tenantId);

        SdsDocument document = new SdsDocument();
        document.setId(documentId);
        document.setTenant(tenant);
        return document;
    }

    private SdsFile file(UUID fileId, UUID documentId, boolean current, String storageKey) {
        SdsFile file = new SdsFile();
        file.setId(fileId);
        file.setSdsDocument(document(documentId, UUID.randomUUID()));
        file.setCurrent(current);
        file.setS3Key(storageKey);
        file.setFileSizeBytes(123);
        file.setCreatedAt(OffsetDateTime.now());
        return file;
    }
}
