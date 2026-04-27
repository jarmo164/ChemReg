## 1. Scope and API contract
- [x] 1.1 Decide the exact ingestion entry point in UI: upload before create, upload inside create, or upload onto existing SDS record.
- [x] 1.2 Define the extraction endpoint contract and response statuses (`success`, `partial`, `unsupported`, `failed`).
- [x] 1.3 Define which mini-SDS fields are mandatory extraction targets for MVP and which are best-effort only.

## 2. Backend ingestion and extraction
- [x] 2.1 Reuse or extend SDS file metadata so original source PDFs are clearly identifiable.
- [x] 2.2 Add backend endpoint to trigger extraction from uploaded SDS PDF.
- [x] 2.3 Integrate a Java PDF text extraction library for text-based PDFs.
- [x] 2.4 Implement raw-text normalization and SDS section heading detection.
- [x] 2.5 Map extracted text into a draft payload aligned with `SaveSdsDocumentRequest`.
- [x] 2.6 Return warnings/partial states without failing the entire flow when some fields cannot be parsed.

## 3. Frontend ingestion UX
- [x] 3.1 Add an upload-first SDS entry flow in `SdsManagement`.
- [x] 3.2 Trigger extraction after successful upload and show progress/state to the user.
- [x] 3.3 Open the mini-SDS form prefilled from extracted draft data.
- [x] 3.4 Make extracted values clearly editable and visibly derived from source PDF.
- [x] 3.5 Preserve preview/download access to the original uploaded PDF from the SDS workflow.

## 4. Quality and rollout safety
- [x] 4.1 Add backend tests for extraction success, partial extraction, unsupported PDFs, and failure handling.
- [ ] 4.2 Add frontend tests for upload -> extract -> review happy path and manual fallback path.
- [ ] 4.3 Validate the flow against a small sample set of real SDS PDFs and document known limitations.
- [x] 4.4 Decide explicitly whether OCR/scanned-PDF support remains deferred after MVP validation.
