package com.chemreg.chemreg.sds.service;

import com.chemreg.chemreg.common.enums.SdsDocumentStatus;
import com.chemreg.chemreg.common.exception.ResourceNotFoundException;
import com.chemreg.chemreg.common.security.AuthorizationRules;
import com.chemreg.chemreg.common.security.CurrentAccessContext;
import com.chemreg.chemreg.sds.dto.SaveSdsDocumentRequest;
import com.chemreg.chemreg.sds.dto.SdsExtractionResponse;
import com.chemreg.chemreg.sds.entity.SdsDocument;
import com.chemreg.chemreg.sds.entity.SdsFile;
import com.chemreg.chemreg.sds.repository.SdsDocumentRepository;
import com.chemreg.chemreg.sds.repository.SdsFileRepository;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class SdsPdfExtractionService {

    private static final Pattern SECTION_HEADING_PATTERN = Pattern.compile(
            "(?i)^\\s*(?:section\\s*)?(1[0-6]|[1-9])\\s*[:.\\-)]?\\s+(.+?)\\s*$"
    );
    private static final Pattern PRODUCT_PATTERN = Pattern.compile(
            "(?im)^(?:product\\s*(?:identifier|name)?|trade\\s*name)\\s*[:\\-]\\s*(.+)$"
    );
    private static final Pattern SUPPLIER_PATTERN = Pattern.compile(
            "(?im)^(?:supplier|manufacturer|company)\\s*(?:name|details)?\\s*[:\\-]\\s*(.+)$"
    );
    private static final Pattern DATE_PATTERN = Pattern.compile(
            "(?im)(?:revision\\s*date|date\\s*of\\s*issue|issue\\s*date|version\\s*date)\\s*[:\\-]?\\s*([0-9]{4}-[0-9]{2}-[0-9]{2}|[0-9]{2}[./][0-9]{2}[./][0-9]{4})"
    );

    private final SdsDocumentRepository sdsDocumentRepository;
    private final SdsFileRepository sdsFileRepository;
    private final SdsBinaryStorage sdsBinaryStorage;
    private final CurrentAccessContext currentAccessContext;

    public SdsPdfExtractionService(
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
    @PreAuthorize(AuthorizationRules.MVP_MANAGE_ROLES)
    public SdsExtractionResponse extract(UUID documentId, UUID fileId) {
        SdsDocument document = requireDocumentForCurrentTenant(documentId);
        SdsFile file = sdsFileRepository.findByIdAndSdsDocumentId(fileId, documentId)
                .orElseThrow(() -> new ResourceNotFoundException("SDS file not found: " + fileId));

        SdsExtractionResponse response = new SdsExtractionResponse();
        response.setDocumentId(documentId);
        response.setFileId(fileId);
        response.setFilename(extractFilename(file.getS3Key()));

        if (!response.getFilename().toLowerCase(Locale.ROOT).endsWith(".pdf")) {
            response.setStatus("unsupported");
            response.setWarnings(List.of("Only PDF source files are supported for auto-prefill."));
            response.setDraft(baseDraft(document));
            return response;
        }

        List<String> warnings = new ArrayList<>();

        try {
            byte[] content = sdsBinaryStorage.read(file.getS3Key());
            String extractedText = extractPdfText(content);

            if (extractedText.isBlank()) {
                response.setStatus("unsupported");
                response.setWarnings(List.of("No extractable text was found in the PDF. This looks like a scanned or unsupported PDF."));
                response.setDraft(baseDraft(document));
                return response;
            }

            String normalizedText = normalize(extractedText);
            file.setExtractedText(normalizedText);
            sdsFileRepository.save(file);

            SaveSdsDocumentRequest draft = buildDraft(document, response.getFilename(), normalizedText, warnings);
            response.setDraft(draft);
            response.setWarnings(warnings);
            response.setStatus(warnings.isEmpty() ? "success" : "partial");
            return response;
        } catch (IOException exception) {
            response.setStatus("failed");
            response.setWarnings(List.of("PDF extraction failed: " + exception.getMessage()));
            response.setDraft(baseDraft(document));
            return response;
        }
    }

    private SaveSdsDocumentRequest buildDraft(
            SdsDocument document,
            String filename,
            String text,
            List<String> warnings
    ) {
        Map<Integer, SectionDraft> detectedSections = detectSections(text);
        String sectionOne = detectedSections.getOrDefault(1, new SectionDraft(1, "Identification", "")).content();

        SaveSdsDocumentRequest draft = baseDraft(document);
        SaveSdsDocumentRequest.DocumentPayload payload = draft.getDocument();
        payload.setProductName(firstNonBlank(
                findMatch(PRODUCT_PATTERN, sectionOne),
                findMatch(PRODUCT_PATTERN, text),
                inferProductName(text),
                safeValue(document.getProductName()),
                stripPdfSuffix(filename)
        ));
        payload.setSupplierNameRaw(firstNonBlank(
                findMatch(SUPPLIER_PATTERN, sectionOne),
                findMatch(SUPPLIER_PATTERN, text),
                document.getSupplierNameRaw()
        ));
        payload.setRevisionDate(firstNonBlank(findNormalizedDate(text), document.getRevisionDate() != null ? document.getRevisionDate().toString() : null));
        payload.setStatus(SdsDocumentStatus.pending_review);

        List<SaveSdsDocumentRequest.SectionPayload> sections = new ArrayList<>();
        for (int i = 1; i <= 8; i++) {
            SectionDraft section = detectedSections.get(i);
            if (section == null || section.content().isBlank()) {
                continue;
            }

            SaveSdsDocumentRequest.SectionPayload sectionPayload = new SaveSdsDocumentRequest.SectionPayload();
            sectionPayload.setSectionNumber(section.number());
            sectionPayload.setTitle(section.title());
            sectionPayload.setContent(section.content());
            sections.add(sectionPayload);
        }

        sections.sort(Comparator.comparing(SaveSdsDocumentRequest.SectionPayload::getSectionNumber));
        draft.setSections(sections);

        if (sections.isEmpty()) {
            warnings.add("No SDS sections 1-8 were confidently detected. Review and fill the mini-SDS manually.");
        }
        if (payload.getSupplierNameRaw() == null || payload.getSupplierNameRaw().isBlank()) {
            warnings.add("Supplier name could not be detected confidently.");
        }
        if (payload.getRevisionDate() == null || payload.getRevisionDate().isBlank()) {
            warnings.add("Revision date could not be detected confidently.");
        }

        return draft;
    }

    private SaveSdsDocumentRequest baseDraft(SdsDocument document) {
        SaveSdsDocumentRequest draft = new SaveSdsDocumentRequest();
        SaveSdsDocumentRequest.DocumentPayload payload = new SaveSdsDocumentRequest.DocumentPayload();
        payload.setProductName(safeValue(document.getProductName()));
        payload.setSupplierNameRaw(document.getSupplierNameRaw());
        payload.setLanguage(safeValue(document.getLanguage(), "et"));
        payload.setCountryFormat(safeValue(document.getCountryFormat(), "EE"));
        payload.setRevisionDate(document.getRevisionDate() != null ? document.getRevisionDate().toString() : null);
        payload.setExpiryDate(document.getExpiryDate() != null ? document.getExpiryDate().toString() : null);
        payload.setStatus(document.getStatus() == null ? SdsDocumentStatus.pending_review : document.getStatus());
        draft.setDocument(payload);
        draft.setSupplierIds(new ArrayList<>());
        draft.setSections(new ArrayList<>());
        return draft;
    }

    private Map<Integer, SectionDraft> detectSections(String text) {
        Map<Integer, SectionDraft> sections = new LinkedHashMap<>();
        Integer currentNumber = null;
        String currentTitle = null;
        StringBuilder currentContent = new StringBuilder();

        for (String line : text.split("\\n")) {
            String trimmed = line.trim();
            Matcher matcher = SECTION_HEADING_PATTERN.matcher(trimmed);
            if (matcher.matches()) {
                if (currentNumber != null) {
                    sections.put(currentNumber, new SectionDraft(currentNumber, cleanupTitle(currentTitle), cleanupContent(currentContent.toString())));
                }
                currentNumber = Integer.parseInt(matcher.group(1));
                currentTitle = matcher.group(2);
                currentContent = new StringBuilder();
                continue;
            }

            if (currentNumber != null && !trimmed.isBlank()) {
                if (!currentContent.isEmpty()) {
                    currentContent.append('\n');
                }
                currentContent.append(trimmed);
            }
        }

        if (currentNumber != null) {
            sections.put(currentNumber, new SectionDraft(currentNumber, cleanupTitle(currentTitle), cleanupContent(currentContent.toString())));
        }

        return sections;
    }

    private String extractPdfText(byte[] content) throws IOException {
        try (PDDocument pdf = Loader.loadPDF(content)) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(pdf);
        }
    }

    private String normalize(String value) {
        return value.replace("\r\n", "\n")
                .replace('\r', '\n')
                .replaceAll("[\\t\\x0B\\f]+", " ")
                .replaceAll("\\n{3,}", "\n\n")
                .trim();
    }

    private String cleanupTitle(String value) {
        return value == null || value.isBlank() ? "Section" : value.trim();
    }

    private String cleanupContent(String value) {
        return value.replaceAll("\\n{3,}", "\n\n").trim();
    }

    private String inferProductName(String text) {
        for (String line : text.split("\\n")) {
            String trimmed = line.trim();
            if (trimmed.isBlank()) {
                continue;
            }
            String normalized = trimmed.toLowerCase(Locale.ROOT);
            if (normalized.contains("safety data sheet") || normalized.startsWith("section ")) {
                continue;
            }
            return trimmed;
        }
        return null;
    }

    private String findMatch(Pattern pattern, String source) {
        if (source == null || source.isBlank()) {
            return null;
        }

        Matcher matcher = pattern.matcher(source);
        return matcher.find() ? matcher.group(1).trim() : null;
    }

    private String findNormalizedDate(String source) {
        String rawValue = findMatch(DATE_PATTERN, source);
        if (rawValue == null) {
            return null;
        }

        for (DateTimeFormatter formatter : List.of(
                DateTimeFormatter.ISO_LOCAL_DATE,
                DateTimeFormatter.ofPattern("dd.MM.yyyy"),
                DateTimeFormatter.ofPattern("dd/MM/yyyy")
        )) {
            try {
                return LocalDate.parse(rawValue, formatter).toString();
            } catch (DateTimeParseException ignored) {
                // Try next pattern.
            }
        }

        return null;
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value.trim();
            }
        }
        return null;
    }

    private String safeValue(String value) {
        return safeValue(value, "");
    }

    private String safeValue(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }

    private String stripPdfSuffix(String filename) {
        if (filename == null || filename.isBlank()) {
            return "Imported SDS";
        }
        return filename.replaceFirst("(?i)\\.pdf$", "").replace('_', ' ').trim();
    }

    private SdsDocument requireDocumentForCurrentTenant(UUID id) {
        UUID tenantId = currentAccessContext.currentTenantId();
        return sdsDocumentRepository.findByIdAndTenant_Id(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("SDS document not found: " + id));
    }

    private String extractFilename(String storageKey) {
        if (storageKey == null || storageKey.isBlank()) {
            return "unknown";
        }

        int separatorIndex = storageKey.lastIndexOf('/');
        return separatorIndex >= 0 ? storageKey.substring(separatorIndex + 1) : storageKey;
    }

    private record SectionDraft(int number, String title, String content) {
    }
}
