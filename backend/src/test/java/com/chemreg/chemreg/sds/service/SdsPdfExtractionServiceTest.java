package com.chemreg.chemreg.sds.service;

import com.chemreg.chemreg.common.enums.SdsDocumentStatus;
import com.chemreg.chemreg.common.security.CurrentAccessContext;
import com.chemreg.chemreg.sds.dto.SdsExtractionResponse;
import com.chemreg.chemreg.sds.entity.SdsDocument;
import com.chemreg.chemreg.sds.entity.SdsFile;
import com.chemreg.chemreg.sds.repository.SdsDocumentRepository;
import com.chemreg.chemreg.sds.repository.SdsFileRepository;
import com.chemreg.chemreg.tenant.entity.Tenant;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SdsPdfExtractionServiceTest {

    @Mock
    private SdsDocumentRepository sdsDocumentRepository;
    @Mock
    private SdsFileRepository sdsFileRepository;
    @Mock
    private SdsBinaryStorage sdsBinaryStorage;
    @Mock
    private CurrentAccessContext currentAccessContext;

    private SdsPdfExtractionService extractionService;

    @BeforeEach
    void setUp() {
        extractionService = new SdsPdfExtractionService(
                sdsDocumentRepository,
                sdsFileRepository,
                sdsBinaryStorage,
                currentAccessContext
        );
    }

    @Test
    void extractBuildsRichDraftFromPdfText() throws Exception {
        UUID tenantId = UUID.randomUUID();
        UUID documentId = UUID.randomUUID();
        UUID fileId = UUID.randomUUID();

        SdsDocument document = document(documentId, tenantId);
        SdsFile file = file(fileId, documentId, "tenant/file/loctite-3621.pdf");

        when(currentAccessContext.currentTenantId()).thenReturn(tenantId);
        when(sdsDocumentRepository.findByIdAndTenant_Id(documentId, tenantId)).thenReturn(Optional.of(document));
        when(sdsFileRepository.findByIdAndSdsDocumentId(fileId, documentId)).thenReturn(Optional.of(file));
        when(sdsFileRepository.save(file)).thenReturn(file);
        when(sdsBinaryStorage.read(file.getS3Key())).thenReturn(samplePdfBytes());

        SdsExtractionResponse response = extractionService.extract(documentId, fileId);

        assertEquals("partial", response.getStatus());
        assertEquals("Loctite 3621", response.getDraft().getDocument().getProductName());
        assertEquals("Henkel Corporation", response.getDraft().getDocument().getSupplierNameRaw());
        assertEquals("2023-06-14", response.getDraft().getDocument().getRevisionDate());
        assertEquals(SdsDocumentStatus.pending_review, response.getDraft().getDocument().getStatus());

        assertTrue(response.getDraft().getSections().stream().anyMatch(section -> section.getSectionNumber() == 2 && section.getContent().contains("WARNING")));
        assertTrue(response.getDraft().getSections().stream().anyMatch(section -> section.getSectionNumber() == 3 && section.getContent().contains("25068-38-6")));
        assertTrue(response.getDraft().getSections().stream().anyMatch(section -> section.getSectionNumber() == 4 && section.getContent().contains("Inhalation")));
        assertTrue(response.getDraft().getSections().stream().anyMatch(section -> section.getSectionNumber() == 7 && section.getContent().contains("Handling")));
        assertTrue(response.getDraft().getSections().stream().anyMatch(section -> section.getSectionNumber() == 8 && section.getContent().contains("Respiratory protection")));
        assertFalse(response.getWarnings().isEmpty());
        verify(sdsFileRepository).save(file);
        assertTrue(file.getExtractedText().contains("Loctite 3621"));
    }

    private byte[] samplePdfBytes() throws IOException {
        List<String> lines = List.of(
                "Safety Data Sheet",
                "Issue date: 06/14/2023",
                "1. PRODUCT AND COMPANY IDENTIFICATION",
                "Product name: Loctite 3621",
                "Item number: 38705",
                "Company address: Henkel Corporation",
                "2. HAZARDS IDENTIFICATION",
                "WARNING: CAUSES SKIN IRRITATION. MAY CAUSE AN ALLERGIC SKIN REACTION.",
                "Pictogram(s)",
                "Prevention: Wear protective gloves, clothing, eye and face protection.",
                "3. COMPOSITION / INFORMATION ON INGREDIENTS",
                "Epichlorohydrin-4,4'-isopropylidene diphenol resin 25068-38-6 10 - 30",
                "4. FIRST AID MEASURES",
                "Inhalation: Move to fresh air.",
                "Skin contact: Remove contaminated clothing and flush skin with water.",
                "Eye contact: Immediately flush eyes with plenty of water.",
                "Ingestion: DO NOT induce vomiting unless directed by medical personnel.",
                "5. FIRE FIGHTING MEASURES",
                "Extinguishing media: Water spray (fog), foam, dry chemical or carbon dioxide.",
                "6. ACCIDENTAL RELEASE MEASURES",
                "Clean-up methods: Scrape up spilled material and place in a closed container for disposal.",
                "7. HANDLING AND STORAGE",
                "Handling: Use only with adequate ventilation. Avoid contact with eyes, skin and clothing.",
                "Storage: Keep in a cool, well ventilated area away from heat, sparks and open flame.",
                "8. EXPOSURE CONTROLS / PERSONAL PROTECTION",
                "Engineering controls: Local exhaust ventilation is recommended.",
                "Respiratory protection: Use NIOSH approved respirator if there is potential to exceed exposure limits.",
                "Eye/face protection: Safety goggles or safety glasses with side shields.",
                "Skin protection: Use impermeable gloves and protective clothing as necessary.",
                "13. DISPOSAL CONSIDERATIONS",
                "Dispose of contents and/or container according to local governmental regulations."
        );

        try (PDDocument pdf = new PDDocument(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            PDPage page = new PDPage();
            pdf.addPage(page);

            try (PDPageContentStream contentStream = new PDPageContentStream(pdf, page)) {
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 10);
                contentStream.beginText();
                contentStream.newLineAtOffset(40, 760);
                contentStream.setLeading(13);
                for (String line : lines) {
                    contentStream.showText(line);
                    contentStream.newLine();
                }
                contentStream.endText();
            }

            pdf.save(output);
            return output.toByteArray();
        }
    }

    private SdsDocument document(UUID documentId, UUID tenantId) {
        Tenant tenant = new Tenant();
        tenant.setId(tenantId);

        SdsDocument document = new SdsDocument();
        document.setId(documentId);
        document.setTenant(tenant);
        document.setProductName("Existing product");
        document.setLanguage("et");
        document.setCountryFormat("EE");
        document.setStatus(SdsDocumentStatus.active);
        document.setRevisionDate(LocalDate.of(2026, 1, 1));
        return document;
    }

    private SdsFile file(UUID fileId, UUID documentId, String storageKey) {
        SdsFile file = new SdsFile();
        file.setId(fileId);
        file.setSdsDocument(document(documentId, UUID.randomUUID()));
        file.setCurrent(true);
        file.setS3Key(storageKey);
        file.setFileSizeBytes(123);
        return file;
    }
}
