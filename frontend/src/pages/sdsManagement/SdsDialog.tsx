import {
  Alert,
  Box,
  Card,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  Close as CloseIcon,
  FileUpload as ImportIcon,
} from '@mui/icons-material';
import ChemRegButton from '../../components/ChemRegButton';
import type { SdsDocument, SdsExtractionResponse } from '../../api/sds';
import { SECTION_DEFINITIONS } from './constants';
import type { ChemicalCardForm, MiniSdsForm, MiniSdsMode } from './types';
import { payloadFromForm, shortId, splitTextareaLines } from './utils';

type SdsDialogProps = {
  open: boolean;
  mode: MiniSdsMode;
  selectedId: string | null;
  selectedDocument: SdsDocument | null;
  form: MiniSdsForm;
  chemicalCardForm: ChemicalCardForm;
  generatedJson: string;
  isSaving: boolean;
  isUploadingFile: boolean;
  extractionStatus: SdsExtractionResponse['status'] | null;
  extractionWarnings: string[];
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onClose: () => void;
  onFieldChange: (field: keyof MiniSdsForm, value: string) => void;
  onChemicalCardFieldChange: (field: keyof ChemicalCardForm, value: string | string[]) => void;
  onRefreshChemicalCardPrefill: () => void;
  onSubmit: () => void;
  onPdfSelected: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenFile: (documentId: string, fileId: string, mode: 'preview' | 'download') => void;
  onGenerateMiniSds: (id: string) => void;
  onOpenChemicalCardPreview: (card: ChemicalCardForm) => void;
  onRunExtraction: (documentId: string, fileId: string) => void;
};

export default function SdsDialog({
  open,
  mode,
  selectedId,
  selectedDocument,
  form,
  chemicalCardForm,
  generatedJson,
  isSaving,
  isUploadingFile,
  extractionStatus,
  extractionWarnings,
  fileInputRef,
  onClose,
  onFieldChange,
  onChemicalCardFieldChange,
  onRefreshChemicalCardPrefill,
  onSubmit,
  onPdfSelected,
  onOpenFile,
  onGenerateMiniSds,
  onOpenChemicalCardPreview,
  onRunExtraction,
}: SdsDialogProps) {
  const files = selectedDocument?.files ?? [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{ fontSize: 22, fontWeight: 800 }}>
              {mode === 'create' ? 'Create mini SDS' : `Edit mini SDS • ${shortId(selectedId)}`}
            </Typography>
            <Typography sx={{ mt: 0.5, fontSize: 13, color: 'text.secondary' }}>
              This now writes directly to the live backend SDS document API.
            </Typography>
          </Box>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          <ExtractionAlert status={extractionStatus} warnings={extractionWarnings} />
          <PdfUploadSection
            selectedId={selectedId}
            files={files}
            isSaving={isSaving}
            isUploadingFile={isUploadingFile}
            fileInputRef={fileInputRef}
            onPdfSelected={onPdfSelected}
            onOpenFile={onOpenFile}
            onRunExtraction={onRunExtraction}
          />
          <MetadataSection form={form} onFieldChange={onFieldChange} />
          <SectionsCard form={form} onFieldChange={onFieldChange} />
          <ChemicalCardSection
            chemicalCardForm={chemicalCardForm}
            onChemicalCardFieldChange={onChemicalCardFieldChange}
            onRefreshChemicalCardPrefill={onRefreshChemicalCardPrefill}
            onOpenChemicalCardPreview={onOpenChemicalCardPreview}
          />
          <JsonPreviewSection
            form={form}
            chemicalCardForm={chemicalCardForm}
            selectedId={selectedId}
            generatedJson={generatedJson}
            isSaving={isSaving}
            onSubmit={onSubmit}
            onGenerateMiniSds={onGenerateMiniSds}
            onOpenChemicalCardPreview={onOpenChemicalCardPreview}
          />
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

function ExtractionAlert({
  status,
  warnings,
}: {
  status: SdsExtractionResponse['status'] | null;
  warnings: string[];
}) {
  if (!status) return null;

  const severity = status === 'success' ? 'success' : status === 'partial' ? 'warning' : 'info';
  const message =
    status === 'success'
      ? 'PDF auto-prefill completed.'
      : status === 'partial'
        ? 'PDF auto-prefill completed partially. Review the highlighted data carefully.'
        : status === 'unsupported'
          ? 'PDF text extraction was not supported for this file. Continue manually.'
          : 'PDF extraction failed. Continue manually.';

  return (
    <Alert severity={severity}>
      {message}
      {warnings.length > 0 ? ` ${warnings.join(' ')}` : ''}
    </Alert>
  );
}

type PdfUploadSectionProps = {
  selectedId: string | null;
  files: SdsDocument['files'];
  isSaving: boolean;
  isUploadingFile: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onPdfSelected: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenFile: (documentId: string, fileId: string, mode: 'preview' | 'download') => void;
  onRunExtraction: (documentId: string, fileId: string) => void;
};

function PdfUploadSection({
  selectedId,
  files,
  isSaving,
  isUploadingFile,
  fileInputRef,
  onPdfSelected,
  onOpenFile,
  onRunExtraction,
}: PdfUploadSectionProps) {
  return (
    <Card variant="outlined" sx={{ p: 2.5, borderColor: 'rgba(20, 184, 166, 0.4)', bgcolor: 'rgba(240, 253, 250, 0.55)' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' } }}>
        <Box>
          <Typography sx={{ fontSize: 16, fontWeight: 800 }}>1. Source SDS PDF</Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
            Start here. Attach the original SDS PDF first and ChemReg will parse as much as it can to prefill the SDS and GPV card fields for you.
          </Typography>
        </Box>
        <ChemRegButton variant="primary" onClick={() => fileInputRef.current?.click()} disabled={isSaving || isUploadingFile}>
          <ImportIcon sx={{ fontSize: 16, mr: 0.5 }} />
          {isUploadingFile ? 'Uploading PDF…' : 'Attach PDF first'}
        </ChemRegButton>
      </Stack>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        onChange={onPdfSelected}
        style={{ display: 'none' }}
      />

      {selectedId ? (
        files.length === 0 ? (
          <Typography sx={{ mt: 2, fontSize: 13, color: 'text.secondary' }}>
            No PDF attached yet. Attach one first if you want the form to fill itself as much as possible.
          </Typography>
        ) : (
          <Stack spacing={1.25} sx={{ mt: 2 }}>
            {files.map((file) => (
              <Stack
                key={file.id}
                direction={{ xs: 'column', md: 'row' }}
                spacing={1.5}
                sx={{
                  p: 1.5,
                  border: '1px solid rgba(15, 23, 42, 0.10)',
                  borderRadius: 2,
                  justifyContent: 'space-between',
                  alignItems: { xs: 'stretch', md: 'center' },
                }}
              >
                <Box>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }} useFlexGap>
                    <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{file.filename}</Typography>
                    {file.current && <Chip size="small" label="Current" color="success" variant="outlined" />}
                  </Stack>
                  <Typography sx={{ mt: 0.5, fontSize: 12, color: 'text.secondary' }}>
                    {(file.fileSizeBytes / 1024).toFixed(1)} KB
                    {file.createdAt ? ` • uploaded ${new Date(file.createdAt).toLocaleString()}` : ''}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <ChemRegButton variant="outline" onClick={() => onOpenFile(selectedId, file.id, 'preview')}>
                    Preview
                  </ChemRegButton>
                  <ChemRegButton variant="outline" onClick={() => onOpenFile(selectedId, file.id, 'download')}>
                    Download
                  </ChemRegButton>
                  <ChemRegButton variant="outline" onClick={() => onRunExtraction(selectedId, file.id)} disabled={isUploadingFile || isSaving}>
                    Prefill
                  </ChemRegButton>
                </Stack>
              </Stack>
            ))}
          </Stack>
        )
      ) : (
        <Typography sx={{ mt: 2, fontSize: 13, color: 'text.secondary' }}>
          Tip: attach a PDF now and ChemReg will create a draft, upload the file, parse it, and prefill the rest for you.
        </Typography>
      )}
    </Card>
  );
}

function MetadataSection({
  form,
  onFieldChange,
}: {
  form: MiniSdsForm;
  onFieldChange: (field: keyof MiniSdsForm, value: string) => void;
}) {
  return (
    <Card variant="outlined" sx={{ p: 2.5 }}>
      <Typography sx={{ fontSize: 16, fontWeight: 800, mb: 2 }}>2. Document metadata</Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ flexWrap: 'wrap' }} useFlexGap>
        <TextField
          label="Product name"
          value={form.productName}
          onChange={(e) => onFieldChange('productName', e.target.value)}
          required
          fullWidth
        />
        <TextField
          label="Supplier name"
          value={form.supplierNameRaw}
          onChange={(e) => onFieldChange('supplierNameRaw', e.target.value)}
          fullWidth
        />
        <TextField
          label="Revision date (YYYY-MM-DD)"
          type="date"
          value={form.revisionDate}
          onChange={(e) => onFieldChange('revisionDate', e.target.value)}
          fullWidth
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          label="Expiry date (YYYY-MM-DD)"
          type="date"
          value={form.expiryDate}
          onChange={(e) => onFieldChange('expiryDate', e.target.value)}
          fullWidth
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          label="Language"
          value={form.language}
          onChange={(e) => onFieldChange('language', e.target.value)}
          fullWidth
        />
        <TextField
          label="Country format"
          value={form.countryFormat}
          onChange={(e) => onFieldChange('countryFormat', e.target.value)}
          fullWidth
        />
        <TextField
          select
          label="Document status"
          value={form.status}
          onChange={(e) => onFieldChange('status', e.target.value)}
          fullWidth
        >
          <MenuItem value="active">active</MenuItem>
          <MenuItem value="pending_review">pending_review</MenuItem>
          <MenuItem value="archived">archived</MenuItem>
        </TextField>
      </Stack>
    </Card>
  );
}

function SectionsCard({
  form,
  onFieldChange,
}: {
  form: MiniSdsForm;
  onFieldChange: (field: keyof MiniSdsForm, value: string) => void;
}) {
  return (
    <Card variant="outlined" sx={{ p: 2.5 }}>
      <Typography sx={{ fontSize: 16, fontWeight: 800, mb: 1 }}>3. Mini SDS sections</Typography>
      <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 2 }}>
        These are auto-filled from the PDF when possible. Review and correct where needed.
      </Typography>
      <Stack spacing={2}>
        {SECTION_DEFINITIONS.map((section) => (
          <Box key={section.key}>
            <Typography sx={{ mb: 1, fontSize: 13, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
              Section {section.number} — {section.title}
            </Typography>
            <TextField
              multiline
              minRows={3}
              fullWidth
              value={form[section.key]}
              onChange={(e) => onFieldChange(section.key, e.target.value)}
            />
          </Box>
        ))}
      </Stack>
    </Card>
  );
}

type ChemicalCardSectionProps = {
  chemicalCardForm: ChemicalCardForm;
  onChemicalCardFieldChange: (field: keyof ChemicalCardForm, value: string | string[]) => void;
  onRefreshChemicalCardPrefill: () => void;
  onOpenChemicalCardPreview: (card: ChemicalCardForm) => void;
};

function ChemicalCardSection({
  chemicalCardForm,
  onChemicalCardFieldChange,
  onRefreshChemicalCardPrefill,
  onOpenChemicalCardPreview,
}: ChemicalCardSectionProps) {
  return (
    <Card variant="outlined" sx={{ p: 2.5 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' }, mb: 2 }}>
        <Box>
          <Typography sx={{ fontSize: 16, fontWeight: 800 }}>GPV chemical card fields</Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
            Auto-filled from the SDS, but editable before export so the final card doesn't depend on parser perfection.
          </Typography>
        </Box>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
          <ChemRegButton variant="outline" onClick={onRefreshChemicalCardPrefill}>
            Refresh from SDS
          </ChemRegButton>
          <ChemRegButton variant="outline" onClick={() => onOpenChemicalCardPreview(chemicalCardForm)}>
            Preview GPV A4 card
          </ChemRegButton>
        </Stack>
      </Stack>

      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
          <TextField label="Kemikaali nimi" value={chemicalCardForm.productName} onChange={(e) => onChemicalCardFieldChange('productName', e.target.value)} fullWidth />
          <TextField label="Tootekood / artikkel" value={chemicalCardForm.productCode} onChange={(e) => onChemicalCardFieldChange('productCode', e.target.value)} fullWidth />
          <TextField label="UFI / CAS / EC" value={chemicalCardForm.identifiers} onChange={(e) => onChemicalCardFieldChange('identifiers', e.target.value)} fullWidth />
          <TextField label="Kasutuskoht / protsess" value={chemicalCardForm.usage} onChange={(e) => onChemicalCardFieldChange('usage', e.target.value)} fullWidth />
          <TextField label="Vastutaja" value={chemicalCardForm.owner} onChange={(e) => onChemicalCardFieldChange('owner', e.target.value)} fullWidth />
          <TextField label="Kuupäev" value={chemicalCardForm.revisionDate} onChange={(e) => onChemicalCardFieldChange('revisionDate', e.target.value)} fullWidth />
          <TextField label="Versioon" value={chemicalCardForm.version} onChange={(e) => onChemicalCardFieldChange('version', e.target.value)} fullWidth />
          <TextField label="Tunnussõna" value={chemicalCardForm.signalWord} onChange={(e) => onChemicalCardFieldChange('signalWord', e.target.value)} fullWidth />
        </Stack>

        <TextField
          label="Peamised ohud"
          multiline
          minRows={2}
          fullWidth
          value={chemicalCardForm.primaryHazards}
          onChange={(e) => onChemicalCardFieldChange('primaryHazards', e.target.value)}
        />

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            label="Piktogrammid (üks reale)"
            multiline
            minRows={4}
            fullWidth
            value={chemicalCardForm.pictograms.join('\n')}
            onChange={(e) => onChemicalCardFieldChange('pictograms', splitTextareaLines(e.target.value))}
          />
          <TextField
            label="IKV (üks reale)"
            multiline
            minRows={4}
            fullWidth
            value={chemicalCardForm.ppe.join('\n')}
            onChange={(e) => onChemicalCardFieldChange('ppe', splitTextareaLines(e.target.value))}
          />
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            label="H-laused (üks reale)"
            multiline
            minRows={6}
            fullWidth
            value={chemicalCardForm.hStatements.join('\n')}
            onChange={(e) => onChemicalCardFieldChange('hStatements', splitTextareaLines(e.target.value))}
          />
          <TextField
            label="P-laused (üks reale)"
            multiline
            minRows={6}
            fullWidth
            value={chemicalCardForm.pStatements.join('\n')}
            onChange={(e) => onChemicalCardFieldChange('pStatements', splitTextareaLines(e.target.value))}
          />
        </Stack>

        <TextField label="Käitlemine ja hoiustamine" multiline minRows={3} fullWidth value={chemicalCardForm.handlingAndStorage} onChange={(e) => onChemicalCardFieldChange('handlingAndStorage', e.target.value)} />

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField label="Esmaabi – sissehingamisel" multiline minRows={2} fullWidth value={chemicalCardForm.firstAidInhalation} onChange={(e) => onChemicalCardFieldChange('firstAidInhalation', e.target.value)} />
          <TextField label="Esmaabi – nahale sattumisel" multiline minRows={2} fullWidth value={chemicalCardForm.firstAidSkin} onChange={(e) => onChemicalCardFieldChange('firstAidSkin', e.target.value)} />
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField label="Esmaabi – silma sattumisel" multiline minRows={2} fullWidth value={chemicalCardForm.firstAidEyes} onChange={(e) => onChemicalCardFieldChange('firstAidEyes', e.target.value)} />
          <TextField label="Esmaabi – allaneelamisel" multiline minRows={2} fullWidth value={chemicalCardForm.firstAidIngestion} onChange={(e) => onChemicalCardFieldChange('firstAidIngestion', e.target.value)} />
        </Stack>

        <TextField label="Lekke / tulekahju korral" multiline minRows={3} fullWidth value={chemicalCardForm.emergency} onChange={(e) => onChemicalCardFieldChange('emergency', e.target.value)} />
        <TextField label="Jäätmekäitlus" multiline minRows={2} fullWidth value={chemicalCardForm.disposal} onChange={(e) => onChemicalCardFieldChange('disposal', e.target.value)} />
        <TextField label="Märkus" multiline minRows={2} fullWidth value={chemicalCardForm.note} onChange={(e) => onChemicalCardFieldChange('note', e.target.value)} />
      </Stack>
    </Card>
  );
}

type JsonPreviewSectionProps = {
  form: MiniSdsForm;
  chemicalCardForm: ChemicalCardForm;
  selectedId: string | null;
  generatedJson: string;
  isSaving: boolean;
  onSubmit: () => void;
  onGenerateMiniSds: (id: string) => void;
  onOpenChemicalCardPreview: (card: ChemicalCardForm) => void;
};

function JsonPreviewSection({
  form,
  chemicalCardForm,
  selectedId,
  generatedJson,
  isSaving,
  onSubmit,
  onGenerateMiniSds,
  onOpenChemicalCardPreview,
}: JsonPreviewSectionProps) {
  return (
    <Card variant="outlined" sx={{ p: 2.5 }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 1, flexWrap: 'wrap' }}>
        <Box>
          <Typography sx={{ fontSize: 16, fontWeight: 800 }}>Generated backend JSON</Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
            Uses live backend shape: `document`, `supplierIds`, `sections`.
          </Typography>
        </Box>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
          <ChemRegButton variant="primary" onClick={onSubmit} disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Save SDS'}
          </ChemRegButton>
          {selectedId && (
            <>
              <ChemRegButton variant="outline" onClick={() => onGenerateMiniSds(selectedId)}>
                Generate mini SDS PDF
              </ChemRegButton>
              <ChemRegButton variant="outline" onClick={() => onOpenChemicalCardPreview(chemicalCardForm)}>
                Generate GPV A4 card
              </ChemRegButton>
            </>
          )}
        </Stack>
      </Stack>
      <Divider sx={{ mb: 2 }} />
      <Box component="pre" sx={{ m: 0, p: 2, borderRadius: 2, bgcolor: '#0f172a', color: '#d1fae5', overflowX: 'auto', fontSize: 12, lineHeight: 1.6 }}>
        {generatedJson || JSON.stringify(payloadFromForm(form), null, 2)}
      </Box>
    </Card>
  );
}