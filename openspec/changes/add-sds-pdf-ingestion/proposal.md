## Why

ChemReg already supported SDS document records and file upload/download/preview, but users still had too much manual retyping between the original supplier PDF and the operational mini-SDS flow.

The implemented MVP improvement is:
- keep the original SDS PDF attached to the record
- parse text-based PDFs when possible
- prefill mini-SDS fields from extracted content
- keep the human in control before save
- explicitly defer OCR-heavy scanned-PDF automation

## What Changed

Delivered in this change:
- first-class PDF ingestion flow in SDS management
- original SDS PDF preserved as the canonical attached source file
- assistive extraction step that returns editable draft data
- explicit extraction states: `success`, `partial`, `unsupported`, `failed`
- frontend review-first UX with warnings surfaced to the user
- GPV card fields can now piggyback on the same extracted mini-SDS draft

Still intentionally out of scope:
- robust scanned-PDF OCR pipeline
- background document AI orchestration
- full auto-approval / blind import
- multi-format ingestion beyond current PDF-first path

## Impact

- SDS ingestion is now source-document-first instead of manual-form-first
- the existing SDS backend file surface was reused rather than replaced
- parsing accuracy is still a product-quality concern, but the system now fails more honestly and usefully
- USER role can now complete the SDS authoring flow instead of being blocked by overly strict manage-role gating
