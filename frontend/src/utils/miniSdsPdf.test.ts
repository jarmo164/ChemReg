import { describe, expect, it } from '@jest/globals';
import type { SdsDocument } from '../api/sds';
import {
  buildChemicalCardDraftFromDocument,
  buildChemicalCardPreviewHtml,
  buildMiniSdsPreviewHtml,
} from './miniSdsPdf';

function createDocument(section2: string): SdsDocument {
  return {
    id: 'sds-1',
    tenantId: 'tenant-1',
    productName: 'Acetone Mix',
    supplierNameRaw: 'Chem Supplier',
    language: 'et',
    countryFormat: 'EE',
    revisionDate: '2026-04-20',
    expiryDate: '2027-04-20',
    status: 'active',
    supplierIds: [],
    sections: [
      {
        id: 'sec-1',
        sectionNumber: 1,
        title: 'Identification',
        content: 'Recommended use: Solvent cleaning',
        createdAt: '2026-04-20T10:00:00Z',
      },
      {
        id: 'sec-2',
        sectionNumber: 2,
        title: 'Hazards',
        content: section2,
        createdAt: '2026-04-20T10:00:00Z',
      },
      {
        id: 'sec-3',
        sectionNumber: 3,
        title: 'Composition',
        content: 'CAS 67-64-1',
        createdAt: '2026-04-20T10:00:00Z',
      },
      {
        id: 'sec-4',
        sectionNumber: 4,
        title: 'First aid',
        content: 'Inhalation: Fresh air. Skin contact: Wash with soap and water. Eye contact: Rinse with water. Ingestion: Seek medical advice.',
        createdAt: '2026-04-20T10:00:00Z',
      },
    ],
    files: [],
    createdAt: '2026-04-20T10:00:00Z',
    updatedAt: '2026-04-21T10:00:00Z',
  };
}

describe('miniSdsPdf pictograms', () => {
  it('adds visual GHS pictograms into mini SDS preview html', () => {
    const document = createDocument(
      'Danger. Highly flammable liquid and vapour. Causes serious eye irritation. H225 Highly flammable liquid and vapour. H319 Causes serious eye irritation.'
    );

    const html = buildMiniSdsPreviewHtml(document);

    expect(html).toContain('GHS pictograms');
    expect(html).toContain('GHS02');
    expect(html).toContain('GHS07');
    expect(html).toContain('Signal word: Ettevaatust');
  });

  it('maps hazard text to multiple pictograms for the GPV card preview', () => {
    const document = createDocument(
      'Warning. Toxic if swallowed. Causes severe skin burns and eye damage. Very toxic to aquatic life with long lasting effects.'
    );

    const card = buildChemicalCardDraftFromDocument(document);
    const html = buildChemicalCardPreviewHtml(card);

    expect(card.pictograms).toEqual(expect.arrayContaining(['GHS05', 'GHS06', 'GHS09']));
    expect(html).toContain('GHS05');
    expect(html).toContain('GHS06');
    expect(html).toContain('GHS09');
  });

  it('uses explicit GHS codes from section text when present', () => {
    const document = createDocument('Classification: Skin Irrit. 2. Label elements: GHS05 GHS07. H314 Causes severe skin burns and eye damage.');

    const card = buildChemicalCardDraftFromDocument(document);

    expect(card.pictograms).toEqual(expect.arrayContaining(['GHS05', 'GHS07']));
  });
});
