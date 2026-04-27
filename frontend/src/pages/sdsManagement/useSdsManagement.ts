import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  createSdsDocument,
  extractSdsFile,
  listSdsDocuments,
  openSdsFile,
  updateSdsDocument,
  uploadSdsFile,
  type SdsDocument,
  type SdsExtractionResponse,
  type SaveSdsDocumentRequest,
} from '../../api/sds';
import {
  buildChemicalCardDraftFromSnapshot,
  buildChemicalCardPreviewHtml,
  openMiniSdsPrintPreview,
} from '../../utils/miniSdsPdf';
import { SECTION_DEFINITIONS } from './constants';
import type { ChemicalCardForm, FilterCounts, MiniSdsForm, MiniSdsMode, SdsListRow, SdsStatus } from './types';
import {
  createChemicalCardForm,
  createEmptyForm,
  extractCasPreview,
  formFromDocument,
  payloadFromForm,
  rowStatusFromExpiryDate,
} from './utils';

export function useSdsManagement() {
  const [documents, setDocuments] = useState<SdsDocument[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SdsStatus>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState<MiniSdsMode>('create');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<MiniSdsForm>(createEmptyForm());
  const [chemicalCardForm, setChemicalCardForm] = useState<ChemicalCardForm>(() => createChemicalCardForm(createEmptyForm()));
  const [generatedJson, setGeneratedJson] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [error, setError] = useState('');
  const [extractionStatus, setExtractionStatus] = useState<SdsExtractionResponse['status'] | null>(null);
  const [extractionWarnings, setExtractionWarnings] = useState<string[]>([]);
  const [chemicalCardPreviewHtml, setChemicalCardPreviewHtml] = useState<string | null>(null);
  const chemicalCardPreviewFrameRef = useRef<HTMLIFrameElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadDocuments = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

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

  const filterCounts = useMemo<FilterCounts>(
    () => ({
      all: listRows.length,
      current: listRows.filter((s) => s.status === 'current').length,
      expiring_soon: listRows.filter((s) => s.status === 'expiring_soon').length,
      expired: listRows.filter((s) => s.status === 'expired').length,
    }),
    [listRows]
  );

  const selectedDocument = useMemo(
    () => (selectedId ? documents.find((doc) => doc.id === selectedId) ?? null : null),
    [documents, selectedId]
  );

  const resetFilePicker = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const openCreateDialog = useCallback(() => {
    const emptyForm = createEmptyForm();
    setMode('create');
    setSelectedId(null);
    setForm(emptyForm);
    setChemicalCardForm(createChemicalCardForm(emptyForm));
    setGeneratedJson('');
    setExtractionStatus(null);
    setExtractionWarnings([]);
    resetFilePicker();
    setDialogOpen(true);
  }, [resetFilePicker]);

  const openEditDialog = useCallback((id: string) => {
    const existing = documents.find((document) => document.id === id);
    if (!existing) return;

    const nextForm = formFromDocument(existing);
    setMode('edit');
    setSelectedId(id);
    setForm(nextForm);
    setChemicalCardForm(createChemicalCardForm(nextForm, existing.updatedAt));
    setGeneratedJson(JSON.stringify(payloadFromForm(nextForm), null, 2));
    setExtractionStatus(null);
    setExtractionWarnings([]);
    resetFilePicker();
    setDialogOpen(true);
  }, [documents, resetFilePicker]);

  const closeDialog = useCallback(() => {
    if (!isSaving && !isUploadingFile) {
      setDialogOpen(false);
    }
  }, [isSaving, isUploadingFile]);

  const upsertDocument = useCallback((saved: SdsDocument) => {
    setDocuments((current) => {
      const existingIndex = current.findIndex((item) => item.id === saved.id);
      if (existingIndex === -1) {
        return [saved, ...current];
      }
      const next = [...current];
      next[existingIndex] = saved;
      return next;
    });
  }, []);

  const persistCurrentDocument = useCallback(async (): Promise<SdsDocument> => {
    const payload = payloadFromForm(form);
    if (!payload.document.productName.trim()) {
      payload.document.productName = 'Imported SDS';
    }

    const saved = selectedId
      ? await updateSdsDocument(selectedId, payload)
      : await createSdsDocument(payload);

    upsertDocument(saved);
    setSelectedId(saved.id);
    setMode('edit');
    setGeneratedJson(JSON.stringify(payload, null, 2));
    return saved;
  }, [form, selectedId, upsertDocument]);

  const mergeDraftIntoForm = useCallback((draft: SaveSdsDocumentRequest) => {
    setForm((current) => {
      const next = createEmptyForm();
      next.productName = draft.document.productName || current.productName;
      next.supplierNameRaw = draft.document.supplierNameRaw || current.supplierNameRaw;
      next.language = draft.document.language || current.language;
      next.countryFormat = draft.document.countryFormat || current.countryFormat;
      next.revisionDate = draft.document.revisionDate || current.revisionDate;
      next.expiryDate = draft.document.expiryDate || current.expiryDate;
      next.status = draft.document.status || current.status;

      for (const section of draft.sections) {
        const definition = SECTION_DEFINITIONS.find((item) => item.number === section.sectionNumber);
        if (definition) {
          next[definition.key] = section.content;
        }
      }

      for (const section of SECTION_DEFINITIONS) {
        if (!next[section.key]) {
          next[section.key] = current[section.key];
        }
      }

      setChemicalCardForm(createChemicalCardForm(next));
      return next;
    });
  }, []);

  const runPdfExtraction = useCallback(async (documentId: string, fileId: string) => {
    const extraction = await extractSdsFile(documentId, fileId);
    setExtractionStatus(extraction.status);
    setExtractionWarnings(extraction.warnings);
    mergeDraftIntoForm(extraction.draft);
    setGeneratedJson(JSON.stringify(extraction.draft, null, 2));
  }, [mergeDraftIntoForm]);

  const handleGenerateMiniSds = useCallback((id: string) => {
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
  }, [documents]);

  const openChemicalCardPreview = useCallback((card: ChemicalCardForm) => {
    try {
      setChemicalCardPreviewHtml(buildChemicalCardPreviewHtml(card));
    } catch (err) {
      const nextError = err as Error;
      setError(nextError.message || 'Chemical card generation failed');
    }
  }, []);

  const closeChemicalCardPreview = useCallback(() => {
    setChemicalCardPreviewHtml(null);
  }, []);

  const printChemicalCard = useCallback(() => {
    const frameWindow = chemicalCardPreviewFrameRef.current?.contentWindow;
    if (!frameWindow) {
      setError('Chemical card preview is not ready for printing yet');
      return;
    }
    frameWindow.focus();
    frameWindow.print();
  }, []);

  const handleGenerateChemicalCard = useCallback((id: string) => {
    const existing = documents.find((document) => document.id === id);
    if (!existing) {
      setError('SDS document not found for generation');
      return;
    }

    openChemicalCardPreview(buildChemicalCardDraftFromSnapshot({
      productName: existing.productName,
      supplierNameRaw: existing.supplierNameRaw,
      language: existing.language,
      countryFormat: existing.countryFormat,
      revisionDate: existing.revisionDate,
      expiryDate: existing.expiryDate,
      status: existing.status,
      updatedAt: existing.updatedAt,
      sections: existing.sections.map((section) => ({
        sectionNumber: section.sectionNumber,
        title: section.title,
        content: section.content,
      })),
    }));
  }, [documents, openChemicalCardPreview]);

  const handleOpenFile = useCallback(async (documentId: string, fileId: string, openMode: 'preview' | 'download') => {
    setError('');
    try {
      const document = documents.find((item) => item.id === documentId);
      const file = document?.files.find((item) => item.id === fileId);
      await openSdsFile(documentId, fileId, openMode, file?.filename);
    } catch (err) {
      const nextError = err as Error;
      setError(nextError.message || `SDS file ${openMode} failed`);
    }
  }, [documents]);

  const payloadForUploadDraft = useCallback((file: File): SaveSdsDocumentRequest => {
    const payload = payloadFromForm(form);
    if (!payload.document.productName.trim()) {
      payload.document.productName = file.name.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ').trim() || 'Imported SDS';
    }
    payload.document.status = 'pending_review';
    return payload;
  }, [form]);

  const handlePdfSelected = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are supported for SDS upload');
      resetFilePicker();
      return;
    }

    setIsUploadingFile(true);
    setError('');
    setExtractionStatus(null);
    setExtractionWarnings([]);

    try {
      const savedDocument = selectedId
        ? await persistCurrentDocument()
        : await createSdsDocument(payloadForUploadDraft(file));

      upsertDocument(savedDocument);
      setSelectedId(savedDocument.id);
      setMode('edit');

      const uploadedFile = await uploadSdsFile(savedDocument.id, file);
      await runPdfExtraction(savedDocument.id, uploadedFile.id);
      await loadDocuments();
    } catch (err) {
      const nextError = err as Error;
      setError(nextError.message || 'SDS PDF upload failed');
    } finally {
      setIsUploadingFile(false);
      resetFilePicker();
    }
  }, [selectedId, persistCurrentDocument, payloadForUploadDraft, upsertDocument, runPdfExtraction, loadDocuments, resetFilePicker]);

  const setField = useCallback((field: keyof MiniSdsForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  }, []);

  const setChemicalCardField = useCallback((field: keyof ChemicalCardForm, value: string | string[]) => {
    setChemicalCardForm((current) => ({ ...current, [field]: value }));
  }, []);

  const refreshChemicalCardPrefill = useCallback(() => {
    const existing = selectedId ? documents.find((document) => document.id === selectedId) : undefined;
    setChemicalCardForm(createChemicalCardForm(form, existing?.updatedAt));
  }, [documents, form, selectedId]);

  const handleSubmit = useCallback(async () => {
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
  }, [form, selectedId, upsertDocument]);

  return {
    // State
    documents,
    search,
    statusFilter,
    dialogOpen,
    mode,
    selectedId,
    selectedDocument,
    form,
    chemicalCardForm,
    generatedJson,
    isLoading,
    isSaving,
    isUploadingFile,
    error,
    extractionStatus,
    extractionWarnings,
    fileInputRef,
    filteredDocuments,
    filterCounts,
    chemicalCardPreviewHtml,
    chemicalCardPreviewFrameRef,

    // Actions
    setSearch,
    setStatusFilter,
    setField,
    setChemicalCardField,
    loadDocuments,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    handleSubmit,
    handlePdfSelected,
    handleOpenFile,
    handleGenerateMiniSds,
    handleGenerateChemicalCard,
    openChemicalCardPreview,
    closeChemicalCardPreview,
    printChemicalCard,
    refreshChemicalCardPrefill,
    runPdfExtraction,
  };
}