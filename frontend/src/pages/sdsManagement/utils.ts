import type { SdsDocument, SaveSdsDocumentRequest } from '../../api/sds';
import { buildChemicalCardDraftFromSnapshot } from '../../utils/miniSdsPdf';
import { SECTION_DEFINITIONS } from './constants';
import type { ChemicalCardForm, MiniSdsForm, SdsStatus } from './types';

export function createEmptyForm(): MiniSdsForm {
  return {
    productName: '',
    supplierNameRaw: '',
    language: 'et',
    countryFormat: 'EE',
    revisionDate: '',
    expiryDate: '',
    status: 'active',
    section1Identification: '',
    section2Hazards: '',
    section3Composition: '',
    section4FirstAid: '',
    section5Firefighting: '',
    section6AccidentalRelease: '',
    section7HandlingStorage: '',
    section8ExposureControl: '',
  };
}

export function payloadFromForm(form: MiniSdsForm): SaveSdsDocumentRequest {
  return {
    document: {
      productName: form.productName.trim(),
      supplierNameRaw: form.supplierNameRaw.trim() || null,
      language: form.language.trim(),
      countryFormat: form.countryFormat.trim(),
      revisionDate: form.revisionDate || null,
      expiryDate: form.expiryDate || null,
      status: form.status,
    },
    supplierIds: [],
    sections: SECTION_DEFINITIONS
      .map((section) => ({
        sectionNumber: section.number,
        title: section.title,
        content: form[section.key].trim(),
      }))
      .filter((section) => section.content.length > 0),
  };
}

export function formFromDocument(document: SdsDocument): MiniSdsForm {
  const form = createEmptyForm();
  form.productName = document.productName;
  form.supplierNameRaw = document.supplierNameRaw ?? '';
  form.language = document.language;
  form.countryFormat = document.countryFormat;
  form.revisionDate = document.revisionDate ?? '';
  form.expiryDate = document.expiryDate ?? '';
  form.status = document.status;

  for (const section of document.sections) {
    const definition = SECTION_DEFINITIONS.find((item) => item.number === section.sectionNumber);
    if (definition) {
      form[definition.key] = section.content;
    }
  }

  return form;
}

export function rowStatusFromExpiryDate(expiryDate: string): SdsStatus {
  if (!expiryDate) return 'current';
  const expiry = new Date(expiryDate);
  const today = new Date();
  const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'expired';
  if (diffDays <= 30) return 'expiring_soon';
  return 'current';
}

export function extractCasPreview(compositionText: string): string {
  const match = compositionText.match(/\b\d{2,7}-\d{2}-\d\b/);
  return match?.[0] ?? '';
}

export function shortId(value: string | null): string {
  if (!value) return '—';
  return value.slice(0, 8);
}

export function chipBaseSx(bgcolor: string, color = 'text.primary') {
  return {
    bgcolor,
    color,
    fontWeight: 600,
    fontSize: 12,
  };
}

export const tableHeadCellSx = {
  fontWeight: 700,
  fontSize: 11,
  color: 'text.secondary',
  textTransform: 'uppercase',
} as const;

export function createChemicalCardForm(form: MiniSdsForm, updatedAt?: string): ChemicalCardForm {
  return buildChemicalCardDraftFromSnapshot({
    productName: form.productName,
    supplierNameRaw: form.supplierNameRaw || null,
    language: form.language,
    countryFormat: form.countryFormat,
    revisionDate: form.revisionDate || null,
    expiryDate: form.expiryDate || null,
    status: form.status,
    updatedAt,
    sections: SECTION_DEFINITIONS.map((section) => ({
      sectionNumber: section.number,
      title: section.title,
      content: form[section.key],
    })),
  });
}

export function splitTextareaLines(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}