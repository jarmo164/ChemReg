## Context

ChemReg already has a live SDS document model plus backend file endpoints for upload, download, and preview. That means the storage part is not the hard problem anymore.

The real design question is how to turn uploaded SDS PDFs into useful structured data without pretending the parser will be universally correct.

SDS PDFs are messy in at least three ways:
- some are true text PDFs and can be parsed directly
- some are exports with odd line breaks and mixed layout artifacts
- some are scanned images and require OCR

For MVP, the system should optimize for the first class and fail safely for the others.

## Decisions

### Decision: Use an assistive extraction model, not blind auto-import
The parser should produce a **draft mini-SDS payload** that the user reviews and edits. ChemReg should not silently convert arbitrary PDFs into final operational records.

This reduces legal and operational risk and makes partial extraction still useful.

### Decision: Keep the uploaded PDF as the canonical source attachment
The uploaded file remains the authoritative source artifact for auditability and later re-checks. The extracted mini-SDS is a derived working representation.

### Decision: Reuse current SDS document + file model
The existing SDS document record and `/files` endpoints are good enough as the storage backbone. The new work should extend around them rather than inventing a parallel ingestion model.

### Decision: Limit MVP extraction to text-based PDFs
Scanned PDFs and OCR should be explicitly marked as deferred unless a very small safe OCR slice is later approved. The first version should be reliable on text PDFs instead of pretending to support everything badly.

## Proposed Flow

### User flow
1. User opens SDS management.
2. User chooses **Upload SDS PDF**.
3. Frontend creates or selects an SDS document context.
4. Frontend uploads the PDF to backend file storage.
5. Frontend calls a new extraction endpoint for that uploaded PDF or for the SDS document.
6. Backend returns a draft payload shaped for the existing mini-SDS form.
7. Frontend opens the form prefilled with extracted values.
8. User reviews, edits, and saves the final mini-SDS document data.
9. Uploaded PDF remains attached for preview/download.

### Backend responsibilities

#### 1. File persistence
Reuse existing file upload/storage behavior.

Likely additions:
- mark file role/type clearly (original SDS source PDF)
- return enough metadata for frontend ingestion state

#### 2. Extraction endpoint
Add a backend endpoint such as one of:
- `POST /api/sds-documents/{id}/extract-from-source-pdf`
- or `POST /api/sds-documents/{id}/files/{fileId}/extract`

Recommended response shape:
- source file metadata
- extraction status (`success`, `partial`, `unsupported`, `failed`)
- warnings list
- extracted mini-SDS draft shaped close to `SaveSdsDocumentRequest`
- optional field-level confidence flags later, but not required for first MVP

#### 3. Text extraction
For MVP, use a server-side PDF text extraction library suitable for Java/Spring. The likely implementation path is Apache PDFBox or similar.

Responsibilities:
- load file bytes
- extract raw text
- normalize whitespace and broken lines conservatively
- preserve enough section structure to recognize SDS headings

#### 4. Draft mapping
Map raw text into:
- metadata
  - product name
  - supplier name
  - language
  - country format when inferable
  - revision date / issue date when inferable
- mini-SDS sections
  - section 1 identification
  - section 2 hazards
  - section 3 composition
  - section 4 first aid
  - section 5 firefighting
  - section 6 accidental release
  - section 7 handling and storage
  - section 8 exposure control

Implementation style:
- deterministic heuristics first
- heading detection by patterns like `Section 1`, `SECTION 1`, `1. Identification`, etc.
- regex/date extraction for metadata
- return partial output rather than failing the whole extraction when one field is missing

### Frontend responsibilities

#### 1. Upload-first entry point
In `SdsManagement`, add a visible entry path:
- upload PDF
- monitor upload result
- trigger extraction
- open mini-SDS editor with extracted draft

#### 2. Review-first UX
The form must make it obvious that extracted values are suggestions.

Useful UI states:
- extraction complete
- partial extraction with warnings
- unsupported PDF type
- extraction failed, continue manually

#### 3. Preserve source visibility
From the draft/edit screen, users should still be able to:
- preview original PDF
- download original PDF
- know which source file the extracted draft came from

## Risks / Trade-offs

- **Main risk:** PDF structure inconsistency will make parsing brittle if the design aims for full automation too early.
- **Trade-off:** assistive extraction is less magical than one-click import, but much safer and more realistic.
- **Operational risk:** very large PDFs or malformed files may need guardrails for size and parser failure handling.
- **Future expansion risk:** OCR can balloon infrastructure and implementation complexity quickly.

## Success Criteria

This change is successful when:
- users can upload an SDS PDF and have it stored on the server
- users can preview/download that original file afterward
- text-based PDFs can produce a draft mini-SDS payload automatically
- extraction failures degrade gracefully into manual editing
- extracted data is always editable before final save
- representative parsing tests exist for at least a few real SDS PDF samples
