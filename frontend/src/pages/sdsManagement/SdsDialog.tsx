import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Card,
  Chip,
  Dialog,
  DialogActions,
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
  ExpandMore as ExpandMoreIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
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
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
      <DialogTitle sx={{ pb: 1.5, borderBottom: '1px solid rgba(15,23,42,0.08)', background: 'linear-gradient(180deg, rgba(248,250,252,0.95) 0%, rgba(255,255,255,1) 100%)' }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{ fontSize: 22, fontWeight: 800 }}>
              {mode === 'create' ? 'Create mini SDS' : `Edit mini SDS • ${shortId(selectedId)}`}
            </Typography>
            <Typography sx={{ mt: 0.5, fontSize: 13, color: 'text.secondary', maxWidth: 720 }}>
              Follow the steps in order: attach the original SDS PDF, review the prefilled data, then save and export. The technical payload is still available, but it stays out of the way by default.
            </Typography>
          </Box>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent dividers sx={{ bgcolor: '#f8fafc' }}>
        <Stack spacing={2.5}>
          <ProgressChecklist hasPdf={files.length > 0} hasProductName={Boolean(form.productName.trim())} isSaved={Boolean(selectedId)} />
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
          <JsonPreviewSection form={form} generatedJson={generatedJson} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
          Save first, then generate output files from the saved SDS record.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <ChemRegButton variant="outline" onClick={onClose}>
            Close
          </ChemRegButton>
          {selectedId && (
            <>
              <ChemRegButton variant="outline" onClick={() => onGenerateMiniSds(selectedId)}>
                Generate mini SDS PDF
              </ChemRegButton>
              <ChemRegButton variant="outline" onClick={() => onOpenChemicalCardPreview(chemicalCardForm)}>
                Preview GPV A4 card
              </ChemRegButton>
            </>
          )}
          <ChemRegButton variant="primary" onClick={onSubmit} disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Save SDS'}
          </ChemRegButton>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}

function ProgressChecklist({ hasPdf, hasProductName, isSaved }: { hasPdf: boolean; hasProductName: boolean; isSaved: boolean }) {
  const items = [
    { label: 'Source PDF attached', done: hasPdf },
    { label: 'Core metadata filled', done: hasProductName },
    { label: 'SDS saved to backend', done: isSaved },
  ];

  return (
    <Card variant="outlined" sx={{ p: 2, borderRadius: 3, borderColor: 'rgba(15,118,110,0.18)', bgcolor: 'rgba(15,118,110,0.04)', boxShadow: '0 8px 20px rgba(15, 23, 42, 0.03)' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} useFlexGap>
        {items.map((item) => (
          <Stack key={item.label} direction="row" spacing={1} sx={{ alignItems: 'center', flex: 1 }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 18, color: item.done ? '#16a34a' : 'text.disabled' }} />
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: item.done ? 'text.primary' : 'text.secondary' }}>
              {item.label}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Card>
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
        ? 'PDF auto-prefill completed partially. Review the extracted fields carefully.'
        : status === 'unsupported'
          ? 'This PDF could not be parsed automatically. Continue manually.'
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
    <Card variant="outlined" sx={{ p: 2.5, borderRadius: 3, borderColor: 'rgba(20, 184, 166, 0.4)', bgcolor: 'rgba(240, 253, 250, 0.75)', boxShadow: '0 12px 30px rgba(20, 184, 166, 0.08)' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' } }}>
        <Box>
          <Typography sx={{ fontSize: 16, fontWeight: 800 }}>1. Source SDS PDF</Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
            Upload the original supplier SDS first. ChemReg stores it for preview/download and uses it to prefill the editable mini-SDS.
          </Typography>
        </Box>
        <ChemRegButton variant="primary" onClick={() => fileInputRef.current?.click()} disabled={isSaving || isUploadingFile}>
          <ImportIcon sx={{ fontSize: 16, mr: 0.5 }} />
          {isUploadingFile ? 'Uploading PDF…' : files.length > 0 ? 'Replace / add PDF' : 'Attach PDF'}
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
            No PDF attached yet. You can still fill the SDS manually, but importing the source file makes review much faster.
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
                    {file.current && <Chip size="small" label="Current file" color="success" variant="outlined" />}
                  </Stack>
                  <Typography sx={{ mt: 0.5, fontSize: 12, color: 'text.secondary' }}>
                    {(file.fileSizeBytes / 1024).toFixed(1)} KB
                    {file.createdAt ? ` • uploaded ${new Date(file.createdAt).toLocaleString()}` : ''}
                  </Typography>
                </Box>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <ChemRegButton variant="outline" onClick={() => onOpenFile(selectedId, file.id, 'preview')}>
                    Preview
                  </ChemRegButton>
                  <ChemRegButton variant="outline" onClick={() => onOpenFile(selectedId, file.id, 'download')}>
                    Download
                  </ChemRegButton>
                  <ChemRegButton variant="outline" onClick={() => onRunExtraction(selectedId, file.id)} disabled={isUploadingFile || isSaving}>
                    Prefill form
                  </ChemRegButton>
                </Stack>
              </Stack>
            ))}
          </Stack>
        )
      ) : (
        <Typography sx={{ mt: 2, fontSize: 13, color: 'text.secondary' }}>
          Tip: import a PDF now and ChemReg will create the draft, upload the file, parse it, and prefill the next steps for you.
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
    <Card variant="outlined" sx={{ p: 2.5, borderRadius: 3, borderColor: 'rgba(15,23,42,0.08)', boxShadow: '0 8px 20px rgba(15, 23, 42, 0.03)' }}>
      <Typography sx={{ fontSize: 16, fontWeight: 800, mb: 2 }}>2. Document metadata</Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ flexWrap: 'wrap' }} useFlexGap>
        <TextField label="Product name" value={form.productName} onChange={(e) => onFieldChange('productName', e.target.value)} required fullWidth helperText="Required. This becomes the main SDS record name." />
        <TextField label="Supplier name" value={form.supplierNameRaw} onChange={(e) => onFieldChange('supplierNameRaw', e.target.value)} fullWidth />
        <TextField label="Revision date" type="date" value={form.revisionDate} onChange={(e) => onFieldChange('revisionDate', e.target.value)} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
        <TextField label="Expiry date" type="date" value={form.expiryDate} onChange={(e) => onFieldChange('expiryDate', e.target.value)} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
        <TextField label="Language" value={form.language} onChange={(e) => onFieldChange('language', e.target.value)} fullWidth />
        <TextField label="Country format" value={form.countryFormat} onChange={(e) => onFieldChange('countryFormat', e.target.value)} fullWidth />
        <TextField select label="Document status" value={form.status} onChange={(e) => onFieldChange('status', e.target.value)} fullWidth>
          <MenuItem value="active">active</MenuItem>
          <MenuItem value="pending_review">pending review</MenuItem>
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
    <Card variant="outlined" sx={{ p: 2.5, borderRadius: 3, borderColor: 'rgba(15,23,42,0.08)', boxShadow: '0 8px 20px rgba(15, 23, 42, 0.03)' }}>
      <Typography sx={{ fontSize: 16, fontWeight: 800, mb: 1 }}>3. Mini SDS sections</Typography>
      <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 2 }}>
        These sections are auto-filled from the PDF when possible. Open each section, review the extracted text, and correct anything that looks suspicious.
      </Typography>
      <Stack spacing={1.25}>
        {SECTION_DEFINITIONS.map((section, index) => (
          <Accordion key={section.key} disableGutters defaultExpanded={index < 2} sx={{ border: '1px solid rgba(15,23,42,0.08)', borderRadius: '12px !important', overflow: 'hidden', background: '#fff', '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ alignItems: { xs: 'flex-start', md: 'center' }, width: '100%' }}>
                <Typography sx={{ fontSize: 13, fontWeight: 800 }}>
                  Section {section.number} — {section.title}
                </Typography>
                <Chip size="small" label={form[section.key].trim() ? 'Filled' : 'Needs review'} color={form[section.key].trim() ? 'success' : 'default'} variant="outlined" />
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <TextField multiline minRows={4} fullWidth value={form[section.key]} onChange={(e) => onFieldChange(section.key, e.target.value)} />
            </AccordionDetails>
          </Accordion>
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
    <Card variant="outlined" sx={{ p: 2.5, borderRadius: 3, borderColor: 'rgba(15,23,42,0.08)', boxShadow: '0 8px 20px rgba(15, 23, 42, 0.03)' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' }, mb: 2 }}>
        <Box>
          <Typography sx={{ fontSize: 16, fontWeight: 800 }}>4. GPV chemical card fields</Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
            These values are auto-filled from the SDS, but can be adjusted before export so the final card is clear and usable.
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

        <TextField label="Peamised ohud" multiline minRows={2} fullWidth value={chemicalCardForm.primaryHazards} onChange={(e) => onChemicalCardFieldChange('primaryHazards', e.target.value)} />

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField label="Piktogrammid (üks reale)" multiline minRows={4} fullWidth value={chemicalCardForm.pictograms.join('\n')} onChange={(e) => onChemicalCardFieldChange('pictograms', splitTextareaLines(e.target.value))} />
          <TextField label="IKV (üks reale)" multiline minRows={4} fullWidth value={chemicalCardForm.ppe.join('\n')} onChange={(e) => onChemicalCardFieldChange('ppe', splitTextareaLines(e.target.value))} />
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField label="H-laused (üks reale)" multiline minRows={6} fullWidth value={chemicalCardForm.hStatements.join('\n')} onChange={(e) => onChemicalCardFieldChange('hStatements', splitTextareaLines(e.target.value))} />
          <TextField label="P-laused (üks reale)" multiline minRows={6} fullWidth value={chemicalCardForm.pStatements.join('\n')} onChange={(e) => onChemicalCardFieldChange('pStatements', splitTextareaLines(e.target.value))} />
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

function JsonPreviewSection({ form, generatedJson }: { form: MiniSdsForm; generatedJson: string }) {
  return (
    <Accordion disableGutters sx={{ border: '1px solid rgba(15,23,42,0.08)', borderRadius: '12px !important', overflow: 'hidden', background: '#fff', boxShadow: '0 8px 20px rgba(15, 23, 42, 0.03)', '&:before': { display: 'none' } }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box>
          <Typography sx={{ fontSize: 14, fontWeight: 800 }}>Technical payload preview (optional)</Typography>
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
            Open this only if you want to inspect the raw backend JSON shape.
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Divider sx={{ mb: 2 }} />
        <Box component="pre" sx={{ m: 0, p: 2, borderRadius: 2, bgcolor: '#0f172a', color: '#d1fae5', overflowX: 'auto', fontSize: 12, lineHeight: 1.6 }}>
          {generatedJson || JSON.stringify(payloadFromForm(form), null, 2)}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
