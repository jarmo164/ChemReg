## Why

ChemReg already supports SDS document records and file upload/download/preview, but the current user experience still assumes that users either type a mini-SDS manually or upload a file without getting structured help back from it.

For real customer use, two jobs need to work together:

1. **Store the original SDS PDF on the server** so the source document is preserved, previewable, and downloadable.
2. **Extract the most useful metadata and section text from the PDF into the mini-SDS workflow** so users do not need to retype everything.

This is valuable because SDS files are long, inconsistent, and operationally annoying to process by hand. But it is also risky to overpromise. Full blind automation across arbitrary PDFs is not realistic for MVP quality.

The practical MVP is therefore:
- upload and persist the original SDS PDF
- parse text-based PDFs when possible
- prefill mini-SDS fields with extracted content
- always keep the human in control before save
- explicitly defer OCR-heavy scanned-PDF automation until later

## What Changes

- Add a first-class **PDF ingestion flow** to SDS management.
- Keep the original SDS PDF as the canonical attached source file on the server.
- Add an **assistive extraction step** that attempts to prefill mini-SDS metadata and sections from the uploaded PDF.
- Expose extraction results to the frontend as editable draft data, not as silently trusted final data.
- Define the MVP boundary clearly:
  - **in scope:** text-based PDF upload, storage, preview/download, parsing, draft prefill, user review
  - **out of scope for now:** robust scanned-PDF OCR pipeline, background document AI orchestration, full auto-approval, multi-format ingestion

## Recommended Path

### Phase 1 — make upload the primary SDS entry point
- let users start from PDF upload in the SDS screen
- attach the file to an SDS document record
- show upload status, preview, and download access

### Phase 2 — add assistive extraction
- extract raw text from uploaded PDFs
- detect common SDS metadata and sections
- map extracted content into the existing mini-SDS form shape
- let users review and edit before saving

### Phase 3 — harden and expand
- capture extraction failures and partial-match states clearly
- add parsing tests for representative SDS samples
- decide later whether OCR/scanned-PDF support is worth MVP expansion or post-MVP investment

## Capabilities

### Modified Capabilities
- `sds-and-chemical-registry`
- `operational-readiness`

## Impact

- SDS ingestion becomes source-document-first instead of manual-form-first
- the current SDS backend file surface can be reused rather than replaced
- frontend SDS management needs a new upload -> extract -> review flow
- parsing accuracy becomes a product quality concern and requires sample-based verification
