import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {
  Sync as SyncIcon,
  FileUpload as ImportIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import ChemRegButton from '../components/ChemRegButton';
import { openMiniSdsPrintPreview } from '../utils/miniSdsPdf';
import StatusChip from '../components/StatusChip';
import {
  createSdsDocument,
  listSdsDocuments,
  openSdsFile,
  updateSdsDocument,
  uploadSdsFile,
  type BackendSdsStatus,
  type SaveSdsDocumentRequest,
  type SdsDocument,
  type SdsFile,
} from '../api/sds';

type SdsStatus = 'current' | 'expiring_soon' | 'expired';
type MiniSdsMode = 'create' | 'edit';

type SdsListRow = {
  id: string;
  productName: string;
  casNumber: string;
  revision: string;
  supplierName: string;
  expiryDate: string;
  status: SdsStatus;
  currentFile: SdsFile | null;
};

type MiniSdsForm = {
  productName: string;
  supplierNameRaw: string;
  language: string;
  countryFormat: string;
  revisionDate: string;
  expiryDate: string;
  status: BackendSdsStatus;
  section1Identification: string;
  section2Hazards: string;
  section3Composition: string;
  section4FirstAid: string;
  section5Firefighting: string;
  section6AccidentalRelease: string;
  section7HandlingStorage: string;
  section8ExposureControl: string;
};

const sectionDefinitions = [
  { key: 'section1Identification', number: 1, title: 'Identification' },
  { key: 'section2Hazards', number: 2, title: 'Hazard identification' },
  { key: 'section3Composition', number: 3, title: 'Composition / information on ingredients' },
  { key: 'section4FirstAid', number: 4, title: 'First aid measures' },
  { key: 'section5Firefighting', number: 5, title: 'Firefighting measures' },
  { key: 'section6AccidentalRelease', number: 6, title: 'Accidental release measures' },
  { key: 'section7HandlingStorage', number: 7, title: 'Handling and storage' },
  { key: 'section8ExposureControl', number: 8, title: 'Exposure controls / personal protection' },
] as const;

const createEmptyForm = (): MiniSdsForm => ({
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
});

const payloadFromForm = (form: MiniSdsForm): SaveSdsDocumentRequest => ({
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
  sections: sectionDefinitions
    .map((section) => ({
      sectionNumber: section.number,
      title: section.title,
      content: form[section.key].trim(),
    }))
    .filter((section) => section.content.length > 0),
});

const rowStatusFromExpiryDate = (expiryDate: string): SdsStatus => {
  if (!expiryDate) return 'current';
  const expiry = new Date(expiryDate);
  const today = new Date();
  const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'expired';
  if (diffDays <= 30) return 'expiring_soon';
  return 'current';
};

export default function SdsManagement() {
  const [documents, setDocuments] = useState<SdsDocument[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SdsStatus>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState<MiniSdsMode>('create');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<MiniSdsForm>(createEmptyForm());
  const [generatedJson, setGeneratedJson] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function loadDocuments() {
    setIsLoading(true);
    setError('');

    try {
      const data = await listSdsDocuments();
      setDocuments(data);
    } catch (err) {
      const nextError = err as Error;
      setError(nextError.message || 'Failed to load SDS documents');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadDocuments();
  }, []);

  const listRows = useMemo<SdsListRow[]>(() => {
    return documents.map((document) => {
      const compositionSection = document.sections.find((section) => section.sectionNumber === 3)?.content ?? '';
      return {
        id: document.id,
        productName: document.productName,
        casNumber: extractCasPreview(compositionSection),
        revision: document.revisionDate ?? '',
        supplierName: document.supplierNameRaw ?? '—',
        expiryDate: document.expiryDate ?? '',
        status: rowStatusFromExpiryDate(document.expiryDate ?? ''),
        currentFile: document.files.find((file) => file.current) ?? document.files[0] ?? null,
      };
    });
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    return listRows.filter((sds) => {
      const matchesSearch = [sds.id, sds.productName, sds.casNumber, sds.supplierName]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesFilter = statusFilter === 'all' ? true : sds.status === statusFilter;
      return matchesSearch && matchesFilter;
    });
  }, [listRows, search, statusFilter]);

  const filterCounts = useMemo(
    () => ({
      all: listRows.length,
      current: listRows.filter((s) => s.status === 'current').length,
      expiring_soon: listRows.filter((s) => s.status === 'expiring_soon').length,
      expired: listRows.filter((s) => s.status === 'expired').length,
    }),
    [listRows]
  );

  const resetFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openCreateDialog = () => {
    setMode('create');
    setSelectedId(null);
    setForm(createEmptyForm());
    setGeneratedJson('');
    resetFilePicker();
    setDialogOpen(true);
  };

  const openEditDialog = (id: string) => {
    const existing = documents.find((document) => document.id === id);
    if (!existing) return;

    setMode('edit');
    setSelectedId(id);
    setForm(formFromDocument(existing));
    setGeneratedJson(JSON.stringify(payloadFromForm(formFromDocument(existing)), null, 2));
    resetFilePicker();
    setDialogOpen(true);
  };

  const handleGenerateMiniSds = (id: string) => {
    const existing = documents.find((document) => document.id === id);
    if (!existing) {
      setError('SDS document not found for generation');
      return;
    }

    try {
      openMiniSdsPrintPreview(existing);
    } catch (err) {
      const nextError = err as Error;
      setError(nextError.message || 'Mini SDS generation failed');
    }
  };

  const upsertDocument = (saved: SdsDocument) => {
    setDocuments((current) => {
      const existingIndex = current.findIndex((item) => item.id === saved.id);
      if (existingIndex === -1) {
        return [saved, ...current];
      }

      const next = [...current];
      next[existingIndex] = saved;
      return next;
    });
  };

  const persistCurrentDocument = async (): Promise<SdsDocument> => {
    if (!form.productName.trim()) {
      throw new Error('Product name is required before uploading a PDF');
    }

    const payload = payloadFromForm(form);
    if (payload.sections.length === 0) {
      throw new Error('At least one SDS section is required before uploading a PDF');
    }

    const saved = selectedId
      ? await updateSdsDocument(selectedId, payload)
      : await createSdsDocument(payload);

    upsertDocument(saved);
    setSelectedId(saved.id);
    setMode('edit');
    setGeneratedJson(JSON.stringify(payload, null, 2));
    return saved;
  };

  const handlePdfSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are supported for SDS upload');
      resetFilePicker();
      return;
    }

    setIsUploadingFile(true);
    setError('');

    try {
      const savedDocument = await persistCurrentDocument();
      await uploadSdsFile(savedDocument.id, file);
      await loadDocuments();
    } catch (err) {
      const nextError = err as Error;
      setError(nextError.message || 'SDS PDF upload failed');
    } finally {
      setIsUploadingFile(false);
      resetFilePicker();
    }
  };

  const handleOpenFile = async (documentId: string, fileId: string, mode: 'preview' | 'download') => {
    setError('');
    try {
      await openSdsFile(documentId, fileId, mode);
    } catch (err) {
      const nextError = err as Error;
      setError(nextError.message || `SDS file ${mode} failed`);
    }
  };

  const closeDialog = () => {
    if (!isSaving && !isUploadingFile) {
      setDialogOpen(false);
    }
  };

  const setField = (field: keyof MiniSdsForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.productName.trim()) {
      setError('Product name is required');
      return;
    }

    const payload = payloadFromForm(form);
    if (payload.sections.length === 0) {
      setError('At least one SDS section is required');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const saved = selectedId
        ? await updateSdsDocument(selectedId, payload)
        : await createSdsDocument(payload);

      upsertDocument(saved);
      setSelectedId(saved.id);
      setMode('edit');
      setGeneratedJson(JSON.stringify(payload, null, 2));
      setDialogOpen(false);
    } catch (err) {
      const nextError = err as Error;
      setError(nextError.message || 'Saving SDS failed');
    } finally {
      setIsSaving(false);
    }
  };

  const expiredCount = filterCounts.expired;

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography sx={{ fontSize: 24, fontWeight: 900, color: 'text.primary' }}>SDS Management</Typography>
          <Typography sx={{ mt: 0.5, fontSize: 13, color: 'text.secondary' }}>
            Live SDS register backed by tenant-scoped backend documents and sections.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <ChemRegButton variant="outline" onClick={() => void loadDocuments()} disabled={isLoading}>
            <SyncIcon sx={{ fontSize: 16, mr: 0.5 }} />
            Refresh
          </ChemRegButton>
          <ChemRegButton variant="outline" onClick={openCreateDialog}>
            <ImportIcon sx={{ fontSize: 16, mr: 0.5 }} />
            Import SDS PDF
          </ChemRegButton>
          <ChemRegButton variant="primary" onClick={openCreateDialog}>
            <AddIcon sx={{ fontSize: 16, mr: 0.5 }} />
            Add SDS
          </ChemRegButton>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mt: 3, alignItems: 'center', flexWrap: 'wrap' }} useFlexGap>
        <Chip label={`${filterCounts.all} Total SDSs`} sx={chipBaseSx('var(--gpv-gray-100)')} />
        <Chip label={`${filterCounts.current} Current`} sx={chipBaseSx('rgba(46, 164, 79, 0.1)', '#16a34a')} />
        <Chip label={`${filterCounts.expiring_soon} Expiring (30 days)`} sx={chipBaseSx('rgba(245, 158, 11, 0.12)', '#b45309')} />
        <Chip label={`${filterCounts.expired} Expired`} sx={chipBaseSx('rgba(225, 29, 72, 0.1)', '#be123c')} />
        <Box sx={{ flex: 1 }} />
        <Box sx={{ position: 'relative', width: 220 }}>
          <SearchIcon sx={{ position: 'absolute', left: 10, top: 11, fontSize: 18, color: 'text.secondary', zIndex: 1 }} />
          <TextField
            size="small"
            placeholder="Search SDS..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={{ width: 220, '& .MuiInputBase-input': { pl: 4 } }}
          />
        </Box>
        <Select size="small" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'all' | SdsStatus)} sx={{ minWidth: 120 }}>
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="current">Current</MenuItem>
          <MenuItem value="expiring_soon">Expiring</MenuItem>
          <MenuItem value="expired">Expired</MenuItem>
        </Select>
      </Stack>

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

      {expiredCount > 0 && (
        <Box
          sx={{
            mt: 2,
            px: 2,
            py: 1.5,
            bgcolor: 'rgba(225, 29, 72, 0.08)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <WarningIcon sx={{ fontSize: 18, color: '#be123c' }} />
            <Typography sx={{ fontSize: 13, color: '#be123c', fontWeight: 500 }}>
              {expiredCount} SDS expired – associated chemical operations are restricted.
            </Typography>
          </Stack>
          <Typography sx={{ fontSize: 13, color: '#be123c', fontWeight: 700 }}>
            Review required
          </Typography>
        </Box>
      )}

      <Card sx={{ mt: 2, minHeight: 320, display: 'flex', alignItems: isLoading ? 'center' : 'stretch', justifyContent: 'center' }}>
        {isLoading ? (
          <Stack spacing={1} sx={{ alignItems: 'center', py: 6 }}>
            <CircularProgress size={28} />
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Loading SDS documents…</Typography>
          </Stack>
        ) : filteredDocuments.length === 0 ? (
          <Stack spacing={1} sx={{ alignItems: 'center', py: 6 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 700 }}>No SDS documents found</Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
              Add the first SDS document or adjust the current filters.
            </Typography>
          </Stack>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'var(--gpv-gray-100)' }}>
                {['SDS ID', 'Chemical Name', 'CAS Number', 'Revision', 'Manufacturer', 'Expiry Date', 'Status', 'Actions'].map((label) => (
                  <TableCell key={label} sx={tableHeadCellSx}>
                    {label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDocuments.map((sds) => (
                <TableRow key={sds.id} hover>
                  <TableCell><Typography sx={{ fontSize: 13, fontWeight: 600, color: 'var(--gpv-primary-500)' }}>{shortId(sds.id)}</Typography></TableCell>
                  <TableCell><Typography sx={{ fontSize: 13, fontWeight: 500 }}>{sds.productName}</Typography></TableCell>
                  <TableCell><Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{sds.casNumber || '—'}</Typography></TableCell>
                  <TableCell><Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{sds.revision || '—'}</Typography></TableCell>
                  <TableCell><Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{sds.supplierName}</Typography></TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 13, color: sds.status === 'expired' ? '#be123c' : 'text.secondary', fontWeight: sds.status === 'expired' ? 600 : 400 }}>
                      {sds.expiryDate || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell><StatusChip status={sds.status} /></TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                      <IconButton size="small" sx={{ color: 'text.secondary' }} onClick={() => openEditDialog(sds.id)}>
                        <ViewIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                      {sds.currentFile ? (
                        <IconButton size="small" sx={{ color: 'text.secondary' }} onClick={() => void handleOpenFile(sds.id, sds.currentFile!.id, 'preview')}>
                          <PdfIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      ) : null}
                      <IconButton size="small" sx={{ color: 'text.secondary' }} onClick={() => handleGenerateMiniSds(sds.id)}>
                        <DownloadIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="lg" fullWidth>
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
            <IconButton onClick={closeDialog}><CloseIcon /></IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <Card variant="outlined" sx={{ p: 2.5 }}>
              <Typography sx={{ fontSize: 16, fontWeight: 800, mb: 2 }}>Document metadata</Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ flexWrap: 'wrap' }} useFlexGap>
                <TextField label="Product name" value={form.productName} onChange={(e) => setField('productName', e.target.value)} required fullWidth />
                <TextField label="Supplier name" value={form.supplierNameRaw} onChange={(e) => setField('supplierNameRaw', e.target.value)} fullWidth />
                <TextField label="Revision date (YYYY-MM-DD)" type="date" value={form.revisionDate} onChange={(e) => setField('revisionDate', e.target.value)} fullWidth />
                <TextField label="Expiry date (YYYY-MM-DD)" type="date" value={form.expiryDate} onChange={(e) => setField('expiryDate', e.target.value)} fullWidth />
                <TextField label="Language" value={form.language} onChange={(e) => setField('language', e.target.value)} fullWidth />
                <TextField label="Country format" value={form.countryFormat} onChange={(e) => setField('countryFormat', e.target.value)} fullWidth />
                <TextField select label="Document status" value={form.status} onChange={(e) => setField('status', e.target.value)} fullWidth>
                  <MenuItem value="active">active</MenuItem>
                  <MenuItem value="pending_review">pending_review</MenuItem>
                  <MenuItem value="archived">archived</MenuItem>
                </TextField>
              </Stack>
            </Card>

            <Card variant="outlined" sx={{ p: 2.5 }}>
              <Typography sx={{ fontSize: 16, fontWeight: 800, mb: 1 }}>Mini SDS sections</Typography>
              <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 2 }}>
                Keep the content concise. This slice stores document metadata + sections in the live backend so the seeded/demo state is gone.
              </Typography>
              <Stack spacing={2}>
                {sectionDefinitions.map((section) => (
                  <Box key={section.key}>
                    <Typography sx={{ mb: 1, fontSize: 13, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                      Section {section.number} — {section.title}
                    </Typography>
                    <TextField
                      multiline
                      minRows={3}
                      fullWidth
                      value={form[section.key]}
                      onChange={(e) => setField(section.key, e.target.value)}
                    />
                  </Box>
                ))}
              </Stack>
            </Card>

            <Card variant="outlined" sx={{ p: 2.5 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' } }}>
                <Box>
                  <Typography sx={{ fontSize: 16, fontWeight: 800 }}>Source SDS PDF</Typography>
                  <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                    Upload the original PDF and keep it attached for preview/download. If this SDS is new, the form is saved first and then the PDF is attached.
                  </Typography>
                </Box>
                <ChemRegButton variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isSaving || isUploadingFile}>
                  <ImportIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  {isUploadingFile ? 'Uploading PDF…' : 'Attach PDF'}
                </ChemRegButton>
              </Stack>

              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                onChange={(event) => void handlePdfSelected(event)}
                style={{ display: 'none' }}
              />

              {selectedId ? (
                (() => {
                  const selectedDocument = documents.find((document) => document.id === selectedId);
                  const files = selectedDocument?.files ?? [];

                  if (files.length === 0) {
                    return (
                      <Typography sx={{ mt: 2, fontSize: 13, color: 'text.secondary' }}>
                        No PDF attached yet.
                      </Typography>
                    );
                  }

                  return (
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
                              {file.current ? <Chip size="small" label="Current" color="success" variant="outlined" /> : null}
                            </Stack>
                            <Typography sx={{ mt: 0.5, fontSize: 12, color: 'text.secondary' }}>
                              {(file.fileSizeBytes / 1024).toFixed(1)} KB
                              {file.createdAt ? ` • uploaded ${new Date(file.createdAt).toLocaleString()}` : ''}
                            </Typography>
                          </Box>
                          <Stack direction="row" spacing={1}>
                            <ChemRegButton variant="outline" onClick={() => void handleOpenFile(selectedId, file.id, 'preview')}>
                              Preview
                            </ChemRegButton>
                            <ChemRegButton variant="outline" onClick={() => void handleOpenFile(selectedId, file.id, 'download')}>
                              Download
                            </ChemRegButton>
                          </Stack>
                        </Stack>
                      ))}
                    </Stack>
                  );
                })()
              ) : (
                <Typography sx={{ mt: 2, fontSize: 13, color: 'text.secondary' }}>
                  Tip: if you attach a PDF now, ChemReg saves this SDS draft first and then uploads the file.
                </Typography>
              )}
            </Card>

            <Card variant="outlined" sx={{ p: 2.5 }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography sx={{ fontSize: 16, fontWeight: 800 }}>Generated backend JSON</Typography>
                  <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                    Uses live backend shape: `document`, `supplierIds`, `sections`.
                  </Typography>
                </Box>
                <ChemRegButton variant="primary" onClick={() => void handleSubmit()} disabled={isSaving}>
                  {isSaving ? 'Saving…' : 'Save SDS'}
                </ChemRegButton>
                {selectedId ? (
                  <ChemRegButton variant="outline" onClick={() => handleGenerateMiniSds(selectedId)}>
                    Generate mini SDS PDF
                  </ChemRegButton>
                ) : null}
              </Stack>
              <Divider sx={{ mb: 2 }} />
              <Box component="pre" sx={{ m: 0, p: 2, borderRadius: 2, bgcolor: '#0f172a', color: '#d1fae5', overflowX: 'auto', fontSize: 12, lineHeight: 1.6 }}>
                {generatedJson || JSON.stringify(payloadFromForm(form), null, 2)}
              </Box>
            </Card>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

function formFromDocument(document: SdsDocument): MiniSdsForm {
  const form = createEmptyForm();
  form.productName = document.productName;
  form.supplierNameRaw = document.supplierNameRaw ?? '';
  form.language = document.language;
  form.countryFormat = document.countryFormat;
  form.revisionDate = document.revisionDate ?? '';
  form.expiryDate = document.expiryDate ?? '';
  form.status = document.status;

  for (const section of document.sections) {
    const definition = sectionDefinitions.find((item) => item.number === section.sectionNumber);
    if (definition) {
      form[definition.key] = section.content;
    }
  }

  return form;
}

function chipBaseSx(bgcolor: string, color = 'text.primary') {
  return {
    bgcolor,
    color,
    fontWeight: 600,
    fontSize: 12,
  };
}

const tableHeadCellSx = {
  fontWeight: 700,
  fontSize: 11,
  color: 'text.secondary',
  textTransform: 'uppercase',
};

function extractCasPreview(compositionText: string) {
  const match = compositionText.match(/\b\d{2,7}-\d{2}-\d\b/);
  return match?.[0] ?? '';
}

function shortId(value: string | null) {
  if (!value) return '—';
  return value.slice(0, 8);
}
