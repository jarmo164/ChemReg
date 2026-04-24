import type { SdsDocument } from '../api/sds';

type PrintableMiniSds = {
  productName: string;
  supplierName: string;
  revisionDate: string;
  expiryDate: string;
  language: string;
  countryFormat: string;
  status: string;
  sections: Array<{
    number: number;
    title: string;
    content: string;
  }>;
};

export function openMiniSdsPrintPreview(document: SdsDocument) {
  const printable = toPrintable(document);
  const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=1100,height=900');

  if (!printWindow) {
    throw new Error('Pop-up blocked. Allow pop-ups to generate the mini SDS PDF preview.');
  }

  printWindow.document.write(buildHtml(printable));
  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
  }, 250);
}

function toPrintable(document: SdsDocument): PrintableMiniSds {
  return {
    productName: document.productName,
    supplierName: document.supplierNameRaw ?? '—',
    revisionDate: document.revisionDate ?? '—',
    expiryDate: document.expiryDate ?? '—',
    language: document.language,
    countryFormat: document.countryFormat,
    status: document.status,
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

function buildHtml(document: PrintableMiniSds) {
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

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Mini SDS - ${escapeHtml(document.productName)}</title>
        <style>
          @page {
            size: A4;
            margin: 12mm;
          }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            font-family: Inter, Arial, sans-serif;
            color: #0f172a;
            background: #f8fafc;
          }
          .page {
            width: 100%;
            max-width: 210mm;
            margin: 0 auto;
            background: white;
            padding: 18px;
          }
          .hero {
            display: grid;
            grid-template-columns: 1.4fr 1fr;
            gap: 14px;
            margin-bottom: 14px;
          }
          .title-card {
            background: linear-gradient(135deg, #0f766e, #14b8a6);
            color: white;
            border-radius: 16px;
            padding: 18px;
          }
          .title-card h1 {
            margin: 0;
            font-size: 24px;
            line-height: 1.2;
          }
          .title-card p {
            margin: 8px 0 0;
            font-size: 13px;
            opacity: 0.92;
          }
          .meta-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
          }
          .card {
            border: 1px solid #dbe4ee;
            border-radius: 16px;
            padding: 12px 14px;
            background: #ffffff;
          }
          .meta-label {
            display: block;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #64748b;
            margin-bottom: 5px;
            font-weight: 700;
          }
          .meta-value {
            font-size: 14px;
            font-weight: 700;
            color: #0f172a;
          }
          .sections {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
            margin-top: 12px;
          }
          .section-card {
            display: grid;
            grid-template-columns: 36px 1fr;
            gap: 10px;
            min-height: 120px;
          }
          .section-number {
            width: 36px;
            height: 36px;
            border-radius: 999px;
            background: rgba(20, 184, 166, 0.12);
            color: #0f766e;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 15px;
          }
          .section-card h3 {
            margin: 1px 0 6px;
            font-size: 13px;
            line-height: 1.3;
          }
          .section-card p {
            margin: 0;
            font-size: 12px;
            line-height: 1.5;
            color: #334155;
          }
          .footer {
            margin-top: 12px;
            font-size: 11px;
            color: #64748b;
            text-align: right;
          }
          @media print {
            body { background: white; }
            .page { padding: 0; }
          }
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

          <section class="sections">
            ${sectionCards}
          </section>

          <div class="footer">
            Generated from ChemReg mini-SDS form
          </div>
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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
