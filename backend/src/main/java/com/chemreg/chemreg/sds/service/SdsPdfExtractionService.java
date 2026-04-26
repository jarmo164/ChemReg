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
import java.util.stream.Collectors;

@Service
public class SdsPdfExtractionService {

    private static final Pattern SECTION_HEADING_PATTERN = Pattern.compile(
            "(?i)^\\s*(?:section\\s*)?(1[0-6]|[1-9])\\s*[:.\\-)]?\\s+(.+?)\\s*$"
    );
    private static final Pattern PRODUCT_PATTERN = Pattern.compile(
            "(?im)^(?:product\\s*(?:identifier|name)?|trade\\s*name)\\s*[:\\-]?\\s*(.+)$"
    );
    private static final Pattern SUPPLIER_PATTERN = Pattern.compile(
            "(?im)^(?:supplier|manufacturer|company)\\s*(?:name|details)?\\s*[:\\-]?\\s*(.+)$"
    );
    private static final Pattern COMPANY_ADDRESS_BLOCK_PATTERN = Pattern.compile(
            "(?is)company\\s+address\\s*:?\\s*(.+?)(?:contact\\s+information|telephone|emergency|internet|section\\s*2|2\\.\\s*)"
    );
    private static final Pattern DATE_PATTERN = Pattern.compile(
            "(?im)(?:revision\\s*date|date\\s*of\\s*issue|issue\\s*date|version\\s*date|version)\\s*[:\\-]?\\s*([A-Za-z]+\\s+\\d{1,2},\\s*\\d{4}|\\d{4}-\\d{2}-\\d{2}|\\d{1,2}[./-]\\d{1,2}[./-]\\d{4})"
    );
    private static final Pattern PRODUCT_LINE_PATTERN = Pattern.compile("(?im)^product\\s+name\\s*[:\\-]?\\s*(.+)$");
    private static final Pattern ITEM_NUMBER_PATTERN = Pattern.compile("(?im)^(?:item\\s*number|product\\s*code|article|tootekood)\\s*[:\\-]?\\s*(.+)$");
    private static final Pattern CAS_PATTERN = Pattern.compile("\\b\\d{2,7}-\\d{2}-\\d\\b");
    private static final Map<Integer, String> DEFAULT_SECTION_TITLES = Map.ofEntries(
            Map.entry(1, "Identification"),
            Map.entry(2, "Hazard identification"),
            Map.entry(3, "Composition / information on ingredients"),
            Map.entry(4, "First aid measures"),
            Map.entry(5, "Firefighting measures"),
            Map.entry(6, "Accidental release measures"),
            Map.entry(7, "Handling and storage"),
            Map.entry(8, "Exposure controls / personal protection"),
            Map.entry(9, "Physical and chemical properties"),
            Map.entry(10, "Stability and reactivity"),
            Map.entry(11, "Toxicological information"),
            Map.entry(12, "Ecological information"),
            Map.entry(13, "Disposal considerations"),
            Map.entry(14, "Transport information"),
            Map.entry(15, "Regulatory information"),
            Map.entry(16, "Other information")
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
    @PreAuthorize(AuthorizationRules.SDS_AUTHOR_ROLES)
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
        String sectionOne = detectedSections.getOrDefault(1, new SectionDraft(1, DEFAULT_SECTION_TITLES.get(1), "")).content();
        String sectionTwo = detectedSections.getOrDefault(2, new SectionDraft(2, DEFAULT_SECTION_TITLES.get(2), "")).content();
        String sectionThree = detectedSections.getOrDefault(3, new SectionDraft(3, DEFAULT_SECTION_TITLES.get(3), "")).content();

        SaveSdsDocumentRequest draft = baseDraft(document);
        SaveSdsDocumentRequest.DocumentPayload payload = draft.getDocument();
        payload.setProductName(firstNonBlank(
                findMatch(PRODUCT_PATTERN, sectionOne),
                findMatch(PRODUCT_LINE_PATTERN, text),
                inferProductName(text),
                safeValue(document.getProductName()),
                stripPdfSuffix(filename)
        ));
        payload.setSupplierNameRaw(cleanupDetectedSupplier(firstNonBlank(
                findMatch(SUPPLIER_PATTERN, sectionOne),
                extractCompanyAddressName(text),
                findMatch(SUPPLIER_PATTERN, text),
                document.getSupplierNameRaw()
        )));
        payload.setRevisionDate(firstNonBlank(findNormalizedDate(text), document.getRevisionDate() != null ? document.getRevisionDate().toString() : null));
        payload.setStatus(SdsDocumentStatus.pending_review);

        List<SaveSdsDocumentRequest.SectionPayload> sections = new ArrayList<>();
        for (int i = 1; i <= 16; i++) {
            SectionDraft section = detectedSections.get(i);
            if (section == null || section.content().isBlank()) {
                continue;
            }

            SaveSdsDocumentRequest.SectionPayload sectionPayload = new SaveSdsDocumentRequest.SectionPayload();
            sectionPayload.setSectionNumber(section.number());
            sectionPayload.setTitle(firstNonBlank(section.title(), DEFAULT_SECTION_TITLES.get(i), "Section " + i));
            sectionPayload.setContent(section.content());
            sections.add(sectionPayload);
        }

        backfillCoreSections(sections, text);
        sections.sort(Comparator.comparing(SaveSdsDocumentRequest.SectionPayload::getSectionNumber));
        draft.setSections(sections);

        if (sections.isEmpty()) {
            warnings.add("No SDS sections were confidently detected. Review and fill the mini-SDS manually.");
        }
        if (payload.getSupplierNameRaw() == null || payload.getSupplierNameRaw().isBlank()) {
            warnings.add("Supplier name could not be detected confidently.");
        }
        if (payload.getRevisionDate() == null || payload.getRevisionDate().isBlank()) {
            warnings.add("Revision date could not be detected confidently.");
        }
        if (!containsSection(sections, 2) || !containsSection(sections, 7) || !containsSection(sections, 8)) {
            warnings.add("Some key operational sections were only partially detected. Review hazards, handling/storage, and PPE carefully.");
        }
        if (!sectionThree.contains("CAS") && findFirst(CAS_PATTERN, text) != null) {
            warnings.add("CAS data was found in the PDF, but section 3 may still need cleanup.");
        }
        if (findMatch(ITEM_NUMBER_PATTERN, text) == null) {
            warnings.add("Product/item code was not detected confidently.");
        }
        if (!sectionTwo.contains("H") && !sectionTwo.contains("P")) {
            warnings.add("H/P statements were not detected explicitly from section 2.");
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

        for (String line : preprocessLines(text)) {
            String trimmed = line.trim();
            Matcher matcher = SECTION_HEADING_PATTERN.matcher(trimmed);
            if (matcher.matches()) {
                if (currentNumber != null) {
                    sections.put(currentNumber, new SectionDraft(currentNumber, cleanupTitle(currentTitle, currentNumber), cleanupContent(currentContent.toString())));
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
            sections.put(currentNumber, new SectionDraft(currentNumber, cleanupTitle(currentTitle, currentNumber), cleanupContent(currentContent.toString())));
        }

        return sections;
    }

    private List<String> preprocessLines(String text) {
        List<String> rawLines = List.of(text.split("\\n"));
        List<String> cleaned = new ArrayList<>();

        for (String rawLine : rawLines) {
            String trimmed = rawLine.trim();
            if (trimmed.isBlank()) {
                continue;
            }
            String lower = trimmed.toLowerCase(Locale.ROOT);
            if (lower.matches("page\\s+\\d+\\s+of\\s+\\d+")
                    || lower.matches("idh\\s+number.*page\\s+\\d+\\s+of\\s+\\d+")
                    || lower.equals("safety data sheet")
                    || lower.matches("revision number.*issue date.*")) {
                continue;
            }
            cleaned.add(trimmed.replaceAll("\\s+", " "));
        }

        return mergeWrappedLines(cleaned);
    }

    private List<String> mergeWrappedLines(List<String> lines) {
        List<String> merged = new ArrayList<>();
        for (String line : lines) {
            if (!merged.isEmpty() && shouldMergeWithPrevious(merged.get(merged.size() - 1), line)) {
                merged.set(merged.size() - 1, merged.get(merged.size() - 1) + " " + line);
            } else {
                merged.add(line);
            }
        }
        return merged;
    }

    private boolean shouldMergeWithPrevious(String previous, String current) {
        if (SECTION_HEADING_PATTERN.matcher(current).matches()) {
            return false;
        }
        if (previous.endsWith(":")) {
            return true;
        }
        return previous.length() < 100
                && !previous.matches(".*[.!?]$")
                && Character.isLowerCase(previous.charAt(previous.length() - 1))
                && !current.matches("^[A-Z0-9].{0,30}:.*");
    }

    private void backfillCoreSections(List<SaveSdsDocumentRequest.SectionPayload> sections, String text) {
        Map<Integer, SaveSdsDocumentRequest.SectionPayload> byNumber = sections.stream()
                .collect(Collectors.toMap(SaveSdsDocumentRequest.SectionPayload::getSectionNumber, section -> section, (left, right) -> left, LinkedHashMap::new));

        backfillSection(byNumber, 1, buildIdentificationFallback(text));
        backfillSection(byNumber, 2, buildHazardsFallback(text));
        backfillSection(byNumber, 3, buildCompositionFallback(text));
        backfillSection(byNumber, 4, extractSubsectionBlock(text, List.of("Inhalation", "Skin contact", "Eye contact", "Ingestion")));
        backfillSection(byNumber, 5, extractSubsectionBlock(text, List.of("Extinguishing media", "Special firefighting procedures", "Hazardous combustion products")));
        backfillSection(byNumber, 6, extractSubsectionBlock(text, List.of("Environmental precautions", "Clean-up methods", "Personal precautions")));
        backfillSection(byNumber, 7, extractSubsectionBlock(text, List.of("Handling", "Storage")));
        backfillSection(byNumber, 8, extractSubsectionBlock(text, List.of("Engineering controls", "Respiratory protection", "Eye/face protection", "Skin protection")));
        backfillSection(byNumber, 13, extractSubsectionBlock(text, List.of("Disposal", "Waste")));

        sections.clear();
        sections.addAll(byNumber.values());
    }

    private void backfillSection(Map<Integer, SaveSdsDocumentRequest.SectionPayload> byNumber, int sectionNumber, String content) {
        if (content == null || content.isBlank()) {
            return;
        }
        SaveSdsDocumentRequest.SectionPayload existing = byNumber.get(sectionNumber);
        if (existing != null && !existing.getContent().isBlank()) {
            return;
        }
        SaveSdsDocumentRequest.SectionPayload payload = new SaveSdsDocumentRequest.SectionPayload();
        payload.setSectionNumber(sectionNumber);
        payload.setTitle(DEFAULT_SECTION_TITLES.getOrDefault(sectionNumber, "Section " + sectionNumber));
        payload.setContent(cleanupContent(content));
        byNumber.put(sectionNumber, payload);
    }

    private String buildIdentificationFallback(String text) {
        List<String> lines = new ArrayList<>();
        addIfPresent(lines, lineFor(PRODUCT_LINE_PATTERN, text, "Product name"));
        addIfPresent(lines, lineFor(ITEM_NUMBER_PATTERN, text, "Item number"));
        addIfPresent(lines, lineFor(SUPPLIER_PATTERN, text, "Supplier"));
        addIfPresent(lines, lineFor(DATE_PATTERN, text, "Issue date"));
        return String.join("\n", lines);
    }

    private String buildHazardsFallback(String text) {
        String block = extractBlockStartingAt(text, "2. HAZARDS IDENTIFICATION", List.of("3.", "SECTION 3", "3 COMPOSITION"));
        if (block != null) {
            return block;
        }
        List<String> hazardLines = splitLines(text).stream()
                .filter(line -> line.matches(".*\\b(H\\d{3}|P\\d{3}|WARNING|DANGER|irritation|sensitization|mutagenicity|reproductive)\\b.*"))
                .limit(20)
                .toList();
        return String.join("\n", hazardLines);
    }

    private String buildCompositionFallback(String text) {
        String block = extractBlockStartingAt(text, "3. COMPOSITION", List.of("4.", "SECTION 4", "4 FIRST"));
        if (block != null) {
            return block;
        }
        List<String> lines = splitLines(text).stream()
                .filter(line -> CAS_PATTERN.matcher(line).find() || line.matches(".*\\b\\d+\\s*-\\s*\\d+\\b.*"))
                .limit(25)
                .toList();
        return String.join("\n", lines);
    }

    private String extractSubsectionBlock(String text, List<String> labels) {
        List<String> lines = new ArrayList<>();
        for (String label : labels) {
            String value = extractLabelledBlock(text, label);
            if (value != null && !value.isBlank()) {
                lines.add(label + ": " + value);
            }
        }
        return String.join("\n", lines);
    }

    private String extractLabelledBlock(String text, String label) {
        Pattern pattern = Pattern.compile("(?im)^" + Pattern.quote(label) + "\\s*[:\\-]?\\s*(.+)$");
        Matcher matcher = pattern.matcher(text);
        if (!matcher.find()) {
            return null;
        }
        return matcher.group(1).trim();
    }

    private String lineFor(Pattern pattern, String text, String prefix) {
        String value = findMatch(pattern, text);
        return value == null ? null : prefix + ": " + value;
    }

    private String cleanupDetectedSupplier(String value) {
        if (value == null || value.isBlank()) {
            return value;
        }
        return value.replaceFirst("(?i)^address\\s*[:\\-]?\\s*", "").trim();
    }

    private String extractCompanyAddressName(String text) {
        Matcher matcher = COMPANY_ADDRESS_BLOCK_PATTERN.matcher(text);
        if (!matcher.find()) {
            return null;
        }
        for (String line : matcher.group(1).split("\\n")) {
            String trimmed = line.trim().replaceFirst("(?i)^address\\s*[:\\-]?\\s*", "");
            if (!trimmed.isBlank() && !trimmed.matches(".*\\d.*")) {
                return trimmed;
            }
        }
        return null;
    }

    private boolean containsSection(List<SaveSdsDocumentRequest.SectionPayload> sections, int sectionNumber) {
        return sections.stream().anyMatch(section -> section.getSectionNumber() == sectionNumber && !section.getContent().isBlank());
    }

    private String extractBlockStartingAt(String text, String startNeedle, List<String> endNeedles) {
        String upper = text.toUpperCase(Locale.ROOT);
        int start = upper.indexOf(startNeedle.toUpperCase(Locale.ROOT));
        if (start < 0) {
            return null;
        }
        int end = upper.length();
        for (String endNeedle : endNeedles) {
            int candidate = upper.indexOf(endNeedle.toUpperCase(Locale.ROOT), start + startNeedle.length());
            if (candidate > start && candidate < end) {
                end = candidate;
            }
        }
        return cleanupContent(text.substring(start, end));
    }

    private List<String> splitLines(String text) {
        return List.of(text.split("\\n"));
    }

    private String findFirst(Pattern pattern, String source) {
        Matcher matcher = pattern.matcher(source);
        return matcher.find() ? matcher.group() : null;
    }

    private void addIfPresent(List<String> lines, String value) {
        if (value != null && !value.isBlank()) {
            lines.add(value);
        }
    }

    private String extractPdfText(byte[] content) throws IOException {
        try (PDDocument pdf = Loader.loadPDF(content)) {
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
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

    private String cleanupTitle(String value, int sectionNumber) {
        String normalized = value == null ? "" : value.trim();
        return normalized.isBlank() ? DEFAULT_SECTION_TITLES.getOrDefault(sectionNumber, "Section " + sectionNumber) : normalized;
    }

    private String cleanupContent(String value) {
        return value.replaceAll("\\n{3,}", "\n\n").trim();
    }

    private String inferProductName(String text) {
        for (String line : preprocessLines(text)) {
            String normalized = line.toLowerCase(Locale.ROOT);
            if (normalized.contains("safety data sheet")
                    || normalized.startsWith("section ")
                    || normalized.matches("^[1-9].*")
                    || normalized.startsWith("revision number")
                    || normalized.startsWith("issue date")) {
                continue;
            }
            if (line.length() > 2 && line.length() < 120) {
                return line;
            }
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
                DateTimeFormatter.ofPattern("dd/MM/yyyy"),
                DateTimeFormatter.ofPattern("MM/dd/yyyy"),
                DateTimeFormatter.ofPattern("MM-dd-yyyy"),
                DateTimeFormatter.ofPattern("dd-MM-yyyy"),
                DateTimeFormatter.ofPattern("MMMM d, yyyy", Locale.ENGLISH),
                DateTimeFormatter.ofPattern("MMM d, yyyy", Locale.ENGLISH)
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
