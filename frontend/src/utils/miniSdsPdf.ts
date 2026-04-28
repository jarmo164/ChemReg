import type { SdsDocument } from '../api/sds';

type SdsSectionSnapshot = {
  sectionNumber: number;
  title: string;
  content: string;
};

type SdsSnapshot = {
  productName: string;
  supplierNameRaw: string | null;
  language: string;
  countryFormat: string;
  revisionDate: string | null;
  expiryDate: string | null;
  status: string;
  updatedAt?: string;
  sections: SdsSectionSnapshot[];
};

type PrintableMiniSds = {
  productName: string;
  supplierName: string;
  revisionDate: string;
  expiryDate: string;
  language: string;
  countryFormat: string;
  status: string;
  signalWord: string;
  primaryHazards: string;
  pictograms: GhsPictogramCode[];
  sections: Array<{
    number: number;
    title: string;
    content: string;
  }>;
};

const GHS_PICTOGRAM_ORDER = ['GHS01', 'GHS02', 'GHS03', 'GHS04', 'GHS05', 'GHS06', 'GHS07', 'GHS08', 'GHS09'] as const;
type GhsPictogramCode = typeof GHS_PICTOGRAM_ORDER[number];

type GhsPictogramDefinition = {
  code: GhsPictogramCode;
  label: string;
  imageUrl: string;
};

const GHS_IMAGE_BASE_URL = 'https://www.msds-europe.com/wp-content/uploads/2018/06';

const GHS_PICTOGRAMS: Record<GhsPictogramCode, GhsPictogramDefinition> = {
  GHS01: { code: 'GHS01', label: 'Explosive', imageUrl: `${GHS_IMAGE_BASE_URL}/GHS01-Hazard-pictogram.jpg` },
  GHS02: { code: 'GHS02', label: 'Flammable', imageUrl: `${GHS_IMAGE_BASE_URL}/GHS02-Hazard-pictogram.jpg` },
  GHS03: { code: 'GHS03', label: 'Oxidizing', imageUrl: `${GHS_IMAGE_BASE_URL}/GHS03-Hazard-pictogram.jpg` },
  GHS04: { code: 'GHS04', label: 'Gas under pressure', imageUrl: `${GHS_IMAGE_BASE_URL}/GHS04-Hazard-pictogram.jpg` },
  GHS05: { code: 'GHS05', label: 'Corrosive', imageUrl: `${GHS_IMAGE_BASE_URL}/GHS05-Hazard-pictogram.jpg` },
  GHS06: { code: 'GHS06', label: 'Acute toxicity', imageUrl: `${GHS_IMAGE_BASE_URL}/GHS06-Hazard-pictogram.jpg` },
  GHS07: { code: 'GHS07', label: 'Irritant / harmful', imageUrl: `${GHS_IMAGE_BASE_URL}/GHS07-Hazard-pictogram.jpg` },
  GHS08: { code: 'GHS08', label: 'Serious health hazard', imageUrl: `${GHS_IMAGE_BASE_URL}/GHS08-Hazard-pictogram.jpg` },
  GHS09: { code: 'GHS09', label: 'Environmental hazard', imageUrl: `${GHS_IMAGE_BASE_URL}/GHS09-Hazard-pictogram.jpg` },
};

export type ChemicalCardDraft = {
  productName: string;
  productCode: string;
  identifiers: string;
  usage: string;
  owner: string;
  revisionDate: string;
  version: string;
  signalWord: string;
  primaryHazards: string;
  hStatements: string[];
  pStatements: string[];
  pictograms: string[];
  ppe: string[];
  handlingAndStorage: string;
  firstAidInhalation: string;
  firstAidSkin: string;
  firstAidEyes: string;
  firstAidIngestion: string;
  emergency: string;
  disposal: string;
  note: string;
};

export function openMiniSdsPrintPreview(document: SdsDocument) {
  openPrintWindow(`Mini SDS - ${document.productName}`, buildMiniSdsPreviewHtml(document));
}

export function buildMiniSdsPreviewHtml(document: SdsDocument) {
  return buildMiniSdsHtml(toPrintable(document));
}

export function openChemicalCardPrintPreview(document: SdsDocument) {
  openChemicalCardDraftPrintPreview(buildChemicalCardDraftFromDocument(document));
}

export function openChemicalCardDraftPrintPreview(card: ChemicalCardDraft) {
  openPrintWindow(`Kemikaalikaart - ${card.productName}`, buildChemicalCardPreviewHtml(card));
}

export function buildChemicalCardPreviewHtml(card: ChemicalCardDraft) {
  return buildChemicalCardHtml(card).replace(/__TITLE__/g, escapeHtml(`Kemikaalikaart - ${card.productName}`));
}

export function buildChemicalCardDraftFromDocument(document: SdsDocument): ChemicalCardDraft {
  return buildChemicalCardDraftFromSnapshot({
    productName: document.productName,
    supplierNameRaw: document.supplierNameRaw,
    language: document.language,
    countryFormat: document.countryFormat,
    revisionDate: document.revisionDate,
    expiryDate: document.expiryDate,
    status: document.status,
    updatedAt: document.updatedAt,
    sections: document.sections.map((section) => ({
      sectionNumber: section.sectionNumber,
      title: section.title,
      content: section.content,
    })),
  });
}

export function buildChemicalCardDraftFromSnapshot(snapshot: SdsSnapshot): ChemicalCardDraft {
  const sectionMap = new Map(snapshot.sections.map((section) => [section.sectionNumber, section.content?.trim() || '']));
  const identification = sectionMap.get(1) || '';
  const hazards = sectionMap.get(2) || '';
  const composition = sectionMap.get(3) || '';
  const firstAid = sectionMap.get(4) || '';
  const firefighting = sectionMap.get(5) || '';
  const accidentalRelease = sectionMap.get(6) || '';
  const handlingStorage = sectionMap.get(7) || '';
  const exposureControl = sectionMap.get(8) || '';
  const disposal = sectionMap.get(13) || '';

  const hazardStatements = extractStatementsByPrefix(hazards, 'H');
  const precautionaryStatements = extractStatementsByPrefix(hazards, 'P');
  const firstAidLines = extractFirstAid(firstAid);

  return {
    productName: snapshot.productName,
    productCode: extractLabeledValue(identification, ['product code', 'item number', 'item no', 'code']) || '—',
    identifiers: buildIdentifiers(identification, composition),
    usage: extractUsage(identification),
    owner: '—',
    revisionDate: snapshot.revisionDate || '—',
    version: snapshot.updatedAt ? `v${new Date(snapshot.updatedAt).toISOString().slice(0, 10)}` : 'v1.0',
    signalWord: detectSignalWord(hazards),
    primaryHazards: summarizeHazards(hazards),
    hStatements: limitLines(hazardStatements.length > 0 ? hazardStatements : ['Vaata SDS punkt 2.'], 8),
    pStatements: limitLines(precautionaryStatements.length > 0 ? precautionaryStatements : inferPrecautionaryStatements(hazards), 6),
    pictograms: inferPictograms(hazards),
    ppe: inferPpe(exposureControl),
    handlingAndStorage: fallbackText(summarizeOperationalText(handlingStorage), 'Vaata SDS punkt 7.'),
    firstAidInhalation: firstAidLines.inhalation,
    firstAidSkin: firstAidLines.skin,
    firstAidEyes: firstAidLines.eyes,
    firstAidIngestion: firstAidLines.ingestion,
    emergency: fallbackText(joinParagraphs([summarizeOperationalText(firefighting), summarizeOperationalText(accidentalRelease)]), 'Vaata SDS punktid 5 ja 6.'),
    disposal: fallbackText(summarizeOperationalText(disposal), 'Koguda märgistatud ohtlike jäätmete anumasse vastavalt kohalikele nõuetele.'),
    note: 'Sisekasutuseks. Kontrolli alati tootja originaal-SDS-i ja CLP märgistust.',
  };
}

function openPrintWindow(title: string, html: string) {
  const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=1100,height=900');

  if (!printWindow) {
    throw new Error('Pop-up blocked. Allow pop-ups to generate the print preview.');
  }

  printWindow.document.write(html.replace(/__TITLE__/g, escapeHtml(title)));
  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
  }, 250);
}

function toPrintable(document: SdsDocument): PrintableMiniSds {
  const sectionMap = new Map(document.sections.map((section) => [section.sectionNumber, section.content?.trim() || '']));
  const hazards = sectionMap.get(2) || '';

  return {
    productName: document.productName,
    supplierName: document.supplierNameRaw ?? '—',
    revisionDate: document.revisionDate ?? '—',
    expiryDate: document.expiryDate ?? '—',
    language: document.language,
    countryFormat: document.countryFormat,
    status: document.status,
    signalWord: detectSignalWord(hazards),
    primaryHazards: summarizeHazards(hazards),
    pictograms: inferPictograms(hazards),
    sections: document.sections
      .slice()
      .sort((left, right) => left.sectionNumber - right.sectionNumber)
      .map((section) => ({
        number: section.sectionNumber,
        title: section.title,
        content: section.content || '—',
      })),
  };
}

function buildMiniSdsHtml(document: PrintableMiniSds) {
  const sectionCards = document.sections
    .map(
      (section) => `
        <section class="card section-card">
          <div class="section-number">${section.number}</div>
          <div>
            <h3>${escapeHtml(section.title)}</h3>
            <p>${escapeHtml(section.content).replace(/\n/g, '<br/>')}</p>
          </div>
        </section>
      `
    )
    .join('');

  const pictogramMarkup = renderGhsPictogramList(document.pictograms, 'mini');

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>__TITLE__</title>
        <style>
          @page { size: A4; margin: 12mm; }
          * { box-sizing: border-box; }
          body { margin: 0; font-family: Inter, Arial, sans-serif; color: #0f172a; background: #f8fafc; }
          .page { width: 100%; max-width: 210mm; margin: 0 auto; background: white; padding: 18px; }
          .hero { display: grid; grid-template-columns: 1.4fr 1fr; gap: 14px; margin-bottom: 14px; }
          .title-card { background: linear-gradient(135deg, #0f766e, #14b8a6); color: white; border-radius: 16px; padding: 18px; }
          .title-card h1 { margin: 0; font-size: 24px; line-height: 1.2; }
          .title-card p { margin: 8px 0 0; font-size: 13px; opacity: 0.92; }
          .meta-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
          .card { border: 1px solid #dbe4ee; border-radius: 16px; padding: 12px 14px; background: #ffffff; }
          .meta-label { display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-bottom: 5px; font-weight: 700; }
          .meta-value { font-size: 14px; font-weight: 700; color: #0f172a; }
          .hazard-card { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 14px; margin-bottom: 12px; padding: 14px 16px; border: 1px solid #fecdd3; border-radius: 16px; background: linear-gradient(180deg, #fff1f2 0%, #ffffff 100%); }
          .hazard-card h2 { margin: 0 0 8px; font-size: 14px; }
          .signal { display: inline-flex; align-items: center; gap: 6px; padding: 5px 9px; border-radius: 999px; background: #111827; color: white; font-size: 11px; font-weight: 800; text-transform: uppercase; }
          .hazard-text { margin-top: 10px; font-size: 12px; line-height: 1.55; color: #334155; }
          .pictograms { display: flex; flex-wrap: wrap; gap: 10px; align-items: flex-start; }
          .ghs-pictogram { display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 64px; }
          .ghs-pictogram--mini { min-width: 72px; }
          .ghs-pictogram__label { font-size: 10px; font-weight: 800; color: #475467; text-align: center; }
          .ghs-pictogram__name { font-size: 9px; color: #64748b; text-align: center; line-height: 1.2; max-width: 76px; }
          .ghs-image { width: 58px; height: 58px; display: block; object-fit: contain; }
          .ghs-image--mini { width: 64px; height: 64px; }
          .sections { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-top: 12px; }
          .section-card { display: grid; grid-template-columns: 36px 1fr; gap: 10px; min-height: 120px; }
          .section-number { width: 36px; height: 36px; border-radius: 999px; background: rgba(20, 184, 166, 0.12); color: #0f766e; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 15px; }
          .section-card h3 { margin: 1px 0 6px; font-size: 13px; line-height: 1.3; }
          .section-card p { margin: 0; font-size: 12px; line-height: 1.5; color: #334155; }
          .footer { margin-top: 12px; font-size: 11px; color: #64748b; text-align: right; }
          @media print { body { background: white; } .page { padding: 0; } }
        </style>
      </head>
      <body>
        <main class="page">
          <section class="hero">
            <div class="title-card">
              <h1>${escapeHtml(document.productName)}</h1>
              <p>Mini Safety Data Sheet / one-page operational summary</p>
            </div>
            <div class="meta-grid">
              ${metaCard('Supplier', document.supplierName)}
              ${metaCard('Status', document.status)}
              ${metaCard('Revision date', document.revisionDate)}
              ${metaCard('Expiry date', document.expiryDate)}
              ${metaCard('Language', document.language)}
              ${metaCard('Country format', document.countryFormat)}
            </div>
          </section>

          <section class="hazard-card">
            <div>
              <h2>Key hazards and classification cues</h2>
              <div class="signal">Signal word: ${escapeHtml(document.signalWord)}</div>
              <div class="hazard-text"><strong>Main hazards:</strong> ${escapeHtml(document.primaryHazards)}</div>
            </div>
            <div>
              <h2>GHS pictograms</h2>
              <div class="pictograms">${pictogramMarkup}</div>
            </div>
          </section>

          <section class="sections">
            ${sectionCards}
          </section>

          <div class="footer">Generated from ChemReg mini-SDS form</div>
        </main>
      </body>
    </html>
  `;
}

function buildChemicalCardHtml(card: ChemicalCardDraft) {
  return `
    <!DOCTYPE html>
    <html lang="et">
      <head>
        <meta charset="UTF-8" />
        <title>__TITLE__</title>
        <style>
          @page { size: A4; margin: 10mm; }
          * { box-sizing: border-box; }
          body { margin: 0; font-family: Inter, Arial, sans-serif; color: #101828; background: #fff; }
          .page { width: 190mm; margin: 0 auto; border: 1.5px solid #111827; padding: 10mm; }
          .header { display: grid; grid-template-columns: 1fr auto; gap: 12px; align-items: start; border-bottom: 2px solid #111827; padding-bottom: 8px; }
          .brand { font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: #84cc16; font-weight: 900; }
          .title { margin: 4px 0 0; font-size: 28px; font-weight: 900; letter-spacing: -0.03em; }
          .subtitle { margin: 4px 0 0; font-size: 12px; color: #475467; }
          .notice { border: 1px solid #84cc16; background: #f7fee7; color: #365314; border-radius: 10px; padding: 8px 10px; font-size: 11px; line-height: 1.4; max-width: 70mm; }
          .meta-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-top: 10px; }
          .meta { border: 1px solid #d0d5dd; border-radius: 10px; padding: 8px 10px; min-height: 52px; }
          .meta .label { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #667085; font-weight: 800; }
          .meta .value { display: block; margin-top: 4px; font-size: 13px; font-weight: 700; white-space: pre-wrap; }
          .section { border: 1px solid #d0d5dd; border-radius: 12px; padding: 10px; margin-top: 8px; page-break-inside: avoid; }
          .section h2 { margin: 0 0 8px; font-size: 14px; font-weight: 900; }
          .pictograms { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0 10px; }
          .ghs-pictogram { display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 64px; }
          .ghs-pictogram__label { font-size: 9px; font-weight: 800; color: #475467; text-align: center; line-height: 1.2; }
          .ghs-pictogram__name { font-size: 8px; color: #64748b; text-align: center; line-height: 1.2; max-width: 68px; }
          .ghs-image { width: 56px; height: 56px; display: block; object-fit: contain; }
          .signal { display: inline-block; padding: 5px 9px; border-radius: 999px; background: #111827; color: white; font-size: 11px; font-weight: 800; text-transform: uppercase; }
          .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
          ul { margin: 6px 0 0 18px; padding: 0; }
          li { margin-bottom: 4px; font-size: 12px; line-height: 1.4; }
          .checklist li { list-style: none; position: relative; padding-left: 18px; }
          .checklist li::before { content: '□'; position: absolute; left: 0; top: 0; font-weight: 700; }
          .body-text { font-size: 12px; line-height: 1.5; white-space: pre-wrap; }
          .footnote { margin-top: 8px; font-size: 10px; color: #667085; }
        </style>
      </head>
      <body>
        <main class="page">
          <section class="header">
            <div>
              <div class="brand">GPV · Kemikaalikaart</div>
              <h1 class="title">${escapeHtml(card.productName)}</h1>
              <p class="subtitle">Sisetööks kasutatav A4 kaart SDS põhjal</p>
            </div>
            <div class="notice">See kaart on sisekasutuseks ega asenda tootja originaalmärgistust ega ohutuskaarti (SDS).</div>
          </section>

          <section class="meta-grid">
            ${metaCardEt('Kemikaali nimi', card.productName)}
            ${metaCardEt('Tootekood / artikkel', card.productCode)}
            ${metaCardEt('UFI / CAS / EC', card.identifiers)}
            ${metaCardEt('Kasutuskoht / protsess', card.usage)}
            ${metaCardEt('Vastutaja', card.owner)}
            ${metaCardEt('Kuupäev / versioon', `${card.revisionDate} · ${card.version}`)}
          </section>

          <section class="section">
            <h2>1. Ohuinfo ja märgistus</h2>
            <div class="pictograms">${renderGhsPictogramList(card.pictograms)}</div>
            <div class="two-col">
              <div>
                <div class="signal">Tunnussõna: ${escapeHtml(card.signalWord)}</div>
                <div class="body-text" style="margin-top:8px;"><strong>Peamised ohud:</strong> ${escapeHtml(card.primaryHazards)}</div>
              </div>
              <div class="body-text">${escapeHtml(card.note)}</div>
            </div>
          </section>

          <section class="section two-col">
            <div>
              <h2>2. H-laused</h2>
              <ul>${card.hStatements.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}</ul>
            </div>
            <div>
              <h2>2. P-laused</h2>
              <ul>${card.pStatements.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}</ul>
            </div>
          </section>

          <section class="section">
            <h2>3. Nõutavad isikukaitsevahendid (IKV)</h2>
            <ul class="checklist">${card.ppe.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}</ul>
          </section>

          <section class="section">
            <h2>4. Käitlemine ja hoiustamine</h2>
            <div class="body-text">${escapeHtml(card.handlingAndStorage)}</div>
          </section>

          <section class="section two-col">
            <div>
              <h2>5. Esmaabi</h2>
              <div class="body-text"><strong>Sissehingamisel:</strong> ${escapeHtml(card.firstAidInhalation)}</div>
              <div class="body-text"><strong>Nahale sattumisel:</strong> ${escapeHtml(card.firstAidSkin)}</div>
              <div class="body-text"><strong>Silma sattumisel:</strong> ${escapeHtml(card.firstAidEyes)}</div>
              <div class="body-text"><strong>Allaneelamisel:</strong> ${escapeHtml(card.firstAidIngestion)}</div>
            </div>
            <div>
              <h2>6. Lekke / tulekahju korral</h2>
              <div class="body-text">${escapeHtml(card.emergency)}</div>
            </div>
          </section>

          <section class="section">
            <h2>7. Jäätmekäitlus</h2>
            <div class="body-text">${escapeHtml(card.disposal)}</div>
            <div class="footnote">Allikad: SDS punktid 1, 2, 4, 5, 6, 7, 8 ja 13 ning CLP märgistus. Vajadusel täienda käsitsi.</div>
          </section>
        </main>
      </body>
    </html>
  `;
}

function metaCard(label: string, value: string) {
  return `
    <div class="card">
      <span class="meta-label">${escapeHtml(label)}</span>
      <span class="meta-value">${escapeHtml(value || '—')}</span>
    </div>
  `;
}

function metaCardEt(label: string, value: string) {
  return `
    <div class="meta">
      <span class="label">${escapeHtml(label)}</span>
      <span class="value">${escapeHtml(value || '—')}</span>
    </div>
  `;
}

function buildIdentifiers(identification: string, composition: string) {
  const casMatches = [...new Set((composition.match(/\b\d{2,7}-\d{2}-\d\b/g) || []).slice(0, 2))];
  const ecMatches = [...new Set((composition.match(/\b\d{3}-\d{3}-\d\b/g) || []).slice(0, 2))];
  const ufi = extractLabeledValue(identification, ['ufi']);

  return [
    ufi ? `UFI ${ufi}` : '',
    ...casMatches.map((value) => `CAS ${value}`),
    ...ecMatches.map((value) => `EC ${value}`),
  ].filter(Boolean).join(' · ') || 'Vastavalt SDS-le';
}

function extractUsage(identification: string) {
  const explicit = extractLabeledValue(identification, ['recommended use', 'use', 'product type/use', 'product type']);
  if (explicit) return explicit;

  const sentence = splitSentences(identification).find((line) => /use|application|process|epoxy|adhesive|coating/i.test(line));
  return sentence || 'Täpsusta tööprotsess / kasutuskoht';
}

function detectSignalWord(hazards: string) {
  if (/\bdanger\b/i.test(hazards)) return 'Ettevaatust';
  if (/\bwarning\b/i.test(hazards)) return 'Hoiatus';
  return 'Vt SDS';
}

function summarizeHazards(hazards: string) {
  const sentences = splitSentences(hazards)
    .filter((line) => !/precautionary|prevention|response|storage|disposal|classification|hazard class|hazard category|pictogram/i.test(line))
    .filter((line) => /(cause|suspected|fatal|irrit|allergic|toxic|flamm|corros|sensiti|damage|harmful)/i.test(line))
    .map(cleanLine);

  return limitLines(sentences, 3).join('; ') || 'Vaata SDS punkt 2.';
}

function extractStatementsByPrefix(text: string, prefix: 'H' | 'P') {
  const regex = new RegExp(`\\b${prefix}\\d{3}[A-Z]?\\b`, 'g');
  const codes = [...new Set([...text.matchAll(regex)].map((match) => match[0]))];

  if (codes.length > 0) {
    return codes.map((code) => {
      const sentence = splitSentences(text).find((line) => line.includes(code));
      return sentence ? cleanLine(sentence) : code;
    });
  }

  const lines = splitSentences(text).filter((line) => new RegExp(`^${prefix}`, 'i').test(line));
  return lines.map(cleanLine);
}

function inferPrecautionaryStatements(hazards: string) {
  const lines = splitSentences(hazards).filter((line) => /(avoid|wear|wash|store|dispose|rinse|get medical|protective)/i.test(line));
  return limitLines(lines.map(cleanLine), 6).length > 0
    ? limitLines(lines.map(cleanLine), 6)
    : ['Vaata SDS punkt 2.'];
}

function inferPictograms(hazards: string): GhsPictogramCode[] {
  const explicitCodes = [...hazards.matchAll(/\bGHS0[1-9]\b/gi)].map((match) => match[0].toUpperCase());

  const hCodeRules: Array<[RegExp, GhsPictogramCode[]]> = [
    [/\bH20[0-5]\b/gi, ['GHS01']],
    [/\bH22[0-8]\b|\bH24[0-2]\b|\bH25[0-2]\b/gi, ['GHS02']],
    [/\bH270\b|\bH271\b|\bH272\b/gi, ['GHS03']],
    [/\bH280\b|\bH281\b/gi, ['GHS04']],
    [/\bH290\b|\bH314\b|\bH318\b/gi, ['GHS05']],
    [/\bH300\b|\bH301\b|\bH310\b|\bH311\b|\bH330\b|\bH331\b/gi, ['GHS06']],
    [/\bH302\b|\bH312\b|\bH315\b|\bH317\b|\bH319\b|\bH332\b|\bH335\b|\bH336\b/gi, ['GHS07']],
    [/\bH304\b|\bH334\b|\bH340\b|\bH341\b|\bH350\b|\bH351\b|\bH360\b|\bH361\b|\bH362\b|\bH370\b|\bH371\b|\bH372\b|\bH373\b/gi, ['GHS08']],
    [/\bH400\b|\bH410\b|\bH411\b|\bH412\b|\bH413\b/gi, ['GHS09']],
  ];

  const keywordRules: Array<[RegExp, GhsPictogramCode]> = [
    [/explosive|unstable explosive|mass explosion/i, 'GHS01'],
    [/flammable|fire|flash point|sparks|open flame|self-heating|self-reactive/i, 'GHS02'],
    [/oxidiz|oxidis/i, 'GHS03'],
    [/gas under pressure|compressed gas|liquefied gas|refrigerated gas/i, 'GHS04'],
    [/corros|serious eye damage|severe burns|causes severe skin burns/i, 'GHS05'],
    [/fatal|toxic|poison|acute toxicity/i, 'GHS06'],
    [/irritation|sensiti|allergic skin reaction|harmful|drowsiness|respiratory tract irritation/i, 'GHS07'],
    [/mutagen|fertility|unborn child|reproductive|target organ|carcin|aspiration hazard|respiratory sensit/i, 'GHS08'],
    [/aquatic|environment|long lasting effects to aquatic life/i, 'GHS09'],
  ];

  const inferredFromHCodes = hCodeRules.flatMap(([pattern, codes]) => (pattern.test(hazards) ? codes : []));
  const inferredFromKeywords = keywordRules.filter(([pattern]) => pattern.test(hazards)).map(([, label]) => label);
  const result = [...explicitCodes, ...inferredFromHCodes, ...inferredFromKeywords];

  return normalizePictogramCodes(result.length > 0 ? result : ['GHS07']);
}

function inferPpe(exposureControl: string) {
  const lower = exposureControl.toLowerCase();
  const items = [
    lower.includes('goggles') || lower.includes('eye') ? 'Kaitseprillid / visiir' : '',
    lower.includes('glove') ? 'Keemikindad (vali SDS järgi sobiv materjal)' : '',
    lower.includes('protective clothing') || lower.includes('clothing') ? 'Kaitseriietus / põll' : '',
    lower.includes('respirator') || lower.includes('respiratory') ? 'Hingamisteede kaitse' : '',
    /ventilation|local exhaust/i.test(exposureControl) ? 'Kohalik väljatõmme / ventilatsioon vajalik' : '',
  ].filter(Boolean);

  return items.length > 0 ? items : ['Kaitseprillid / visiir', 'Keemikindad', 'Ventilatsioon vastavalt SDS-le'];
}

function extractFirstAid(firstAidSection: string) {
  return {
    inhalation: extractLabeledValue(firstAidSection, ['inhalation']) || 'Viia värske õhu kätte ja vajadusel pöörduda arsti poole.',
    skin: extractLabeledValue(firstAidSection, ['skin contact']) || 'Loputada rohke vee ja seebiga. Eemaldada saastunud riided.',
    eyes: extractLabeledValue(firstAidSection, ['eye contact']) || 'Loputada ettevaatlikult veega mitu minutit ja pöörduda arsti poole.',
    ingestion: extractLabeledValue(firstAidSection, ['ingestion']) || 'Mitte kutsuda esile oksendamist, kui meditsiinitöötaja pole nii juhendanud.',
  };
}

function summarizeOperationalText(text: string) {
  const lines = splitSentences(text).filter((line) => !/not available|none identified/i.test(line));
  return limitLines(lines, 5).join(' ');
}

function extractLabeledValue(text: string, labels: string[]) {
  for (const label of labels) {
    const regex = new RegExp(`${escapeRegex(label)}\\s*[:.-]?\\s*([^\\n.]+)`, 'i');
    const match = text.match(regex);
    if (match?.[1]) {
      return cleanLine(match[1]);
    }
  }
  return '';
}

function splitSentences(text: string) {
  return text
    .split(/\n+/)
    .flatMap((line) => line.split(/(?<=[.!?])\s+/))
    .map((line) => cleanLine(line))
    .filter(Boolean);
}

function joinParagraphs(lines: string[]) {
  return lines.map((line) => line.trim()).filter(Boolean).join('\n\n');
}

function cleanLine(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function fallbackText(value: string, fallback: string) {
  return value.trim() || fallback;
}

function limitLines<T>(lines: T[], max: number) {
  return lines.slice(0, max);
}

function normalizePictogramCodes(codes: string[]): GhsPictogramCode[] {
  const seen = new Set<GhsPictogramCode>();

  for (const code of GHS_PICTOGRAM_ORDER) {
    if (codes.includes(code)) {
      seen.add(code);
    }
  }

  return Array.from(seen);
}

function renderGhsPictogramList(codes: string[], variant: 'card' | 'mini' = 'card') {
  const normalized = normalizePictogramCodes(codes);
  return normalized.map((code) => renderGhsPictogram(code, variant)).join('');
}

function renderGhsPictogram(code: GhsPictogramCode, variant: 'card' | 'mini') {
  const definition = GHS_PICTOGRAMS[code];
  const sizeClass = variant === 'mini' ? ' ghs-image--mini' : '';
  const wrapperClass = variant === 'mini' ? 'ghs-pictogram ghs-pictogram--mini' : 'ghs-pictogram';

  return `
    <div class="${wrapperClass}" title="${escapeHtml(`${definition.code} · ${definition.label}`)}" aria-label="${escapeHtml(definition.label)}">
      <img class="ghs-image${sizeClass}" src="${escapeHtml(definition.imageUrl)}" alt="${escapeHtml(definition.code)}" loading="eager" referrerpolicy="no-referrer" />
      <div class="ghs-pictogram__label">${escapeHtml(definition.code)}</div>
      <div class="ghs-pictogram__name">${escapeHtml(definition.label)}</div>
    </div>
  `;
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
