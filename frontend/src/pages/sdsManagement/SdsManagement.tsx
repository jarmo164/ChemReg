import {
  Alert,
  Box,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  Sync as SyncIcon,
  FileUpload as ImportIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Warning as WarningIcon,
  AutoAwesome as AutoAwesomeIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import ChemRegButton from '../../components/ChemRegButton';
import SdsDialog from './SdsDialog';
import SdsTable from './SdsTable';
import { useSdsManagement } from './useSdsManagement';
import type { SdsStatus } from './types';
import { chipBaseSx } from './utils';

export default function SdsManagement() {
  const {
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
  } = useSdsManagement();

  return (
    <Box sx={{ display: 'grid', gap: 2.5 }}>
      <Header
        isLoading={isLoading}
        onRefresh={loadDocuments}
        onImport={openCreateDialog}
        onAdd={openCreateDialog}
      />

      <QuickGuide />

      <FilterBar
        filterCounts={filterCounts}
        search={search}
        statusFilter={statusFilter}
        onSearchChange={setSearch}
        onStatusFilterChange={setStatusFilter}
      />

      {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

      <ExpiredWarning count={filterCounts.expired} />

      <SdsTable
        rows={filteredDocuments}
        isLoading={isLoading}
        onView={openEditDialog}
        onOpenFile={(docId, fileId, openMode) => void handleOpenFile(docId, fileId, openMode)}
        onGenerateMiniSds={handleGenerateMiniSds}
        onGenerateChemicalCard={handleGenerateChemicalCard}
      />

      <SdsDialog
        open={dialogOpen}
        mode={mode}
        selectedId={selectedId}
        selectedDocument={selectedDocument}
        form={form}
        chemicalCardForm={chemicalCardForm}
        generatedJson={generatedJson}
        isSaving={isSaving}
        isUploadingFile={isUploadingFile}
        extractionStatus={extractionStatus}
        extractionWarnings={extractionWarnings}
        fileInputRef={fileInputRef}
        onClose={closeDialog}
        onFieldChange={setField}
        onChemicalCardFieldChange={setChemicalCardField}
        onRefreshChemicalCardPrefill={refreshChemicalCardPrefill}
        onSubmit={() => void handleSubmit()}
        onPdfSelected={(e) => void handlePdfSelected(e)}
        onOpenFile={(docId, fileId, openMode) => void handleOpenFile(docId, fileId, openMode)}
        onGenerateMiniSds={handleGenerateMiniSds}
        onOpenChemicalCardPreview={openChemicalCardPreview}
        onRunExtraction={(docId, fileId) => void runPdfExtraction(docId, fileId)}
      />

      <ChemicalCardPreviewDialog
        open={Boolean(chemicalCardPreviewHtml)}
        html={chemicalCardPreviewHtml}
        frameRef={chemicalCardPreviewFrameRef}
        onClose={closeChemicalCardPreview}
        onPrint={printChemicalCard}
      />
    </Box>
  );
}

type HeaderProps = {
  isLoading: boolean;
  onRefresh: () => void;
  onImport: () => void;
  onAdd: () => void;
};

function Header({ isLoading, onRefresh, onImport, onAdd }: HeaderProps) {
  return (
    <Card
      sx={{
        p: { xs: 2.25, md: 3 },
        borderRadius: 3,
        border: '1px solid rgba(59,130,246,0.10)',
        background: 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(239,246,255,0.92) 100%)',
        boxShadow: '0 18px 45px rgba(15, 23, 42, 0.08)',
      }}
    >
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', lg: 'flex-start' } }}>
        <Box>
          <Chip label="SDS Workspace" size="small" sx={{ mb: 1.25, fontWeight: 700, bgcolor: 'rgba(29,78,216,0.08)', color: '#1d4ed8' }} />
          <Typography sx={{ fontSize: 28, fontWeight: 900, color: 'text.primary', letterSpacing: '-0.02em' }}>SDS Management</Typography>
          <Typography sx={{ mt: 0.75, fontSize: 13, lineHeight: 1.6, color: 'text.secondary', maxWidth: 720 }}>
            Keep the original SDS PDF, turn it into an editable mini-SDS, and generate a GPV card from the same record. The workflow below is ordered to match how users actually work.
          </Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <ChemRegButton variant="outline" onClick={() => void onRefresh()} disabled={isLoading}>
            <SyncIcon sx={{ fontSize: 16, mr: 0.5 }} />
            Refresh
          </ChemRegButton>
          <ChemRegButton variant="outline" onClick={onAdd}>
            <AddIcon sx={{ fontSize: 16, mr: 0.5 }} />
            Add manually
          </ChemRegButton>
          <ChemRegButton variant="primary" onClick={onImport}>
            <ImportIcon sx={{ fontSize: 16, mr: 0.5 }} />
            Start from PDF
          </ChemRegButton>
        </Stack>
      </Stack>
    </Card>
  );
}

function QuickGuide() {
  return (
    <Card sx={{ p: 2.5, borderRadius: 3, bgcolor: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.12)', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} useFlexGap>
        <GuideStep
          icon={<DescriptionIcon sx={{ fontSize: 18, color: '#1d4ed8' }} />}
          title="1. Attach the SDS PDF"
          body="ChemReg keeps the source file for preview and download."
        />
        <GuideStep
          icon={<AutoAwesomeIcon sx={{ fontSize: 18, color: '#0f766e' }} />}
          title="2. Let ChemReg prefill the draft"
          body="Extraction fills the key sections so the user fixes only what matters."
        />
        <GuideStep
          icon={<DescriptionIcon sx={{ fontSize: 18, color: '#7c3aed' }} />}
          title="3. Review, save, and export"
          body="The saved SDS can then power mini-SDS and GPV card output."
        />
      </Stack>
    </Card>
  );
}

function GuideStep({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
      <Box sx={{ mt: 0.25 }}>{icon}</Box>
      <Box>
        <Typography sx={{ fontSize: 13, fontWeight: 800 }}>{title}</Typography>
        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{body}</Typography>
      </Box>
    </Stack>
  );
}

type FilterBarProps = {
  filterCounts: { all: number; current: number; expiring_soon: number; expired: number };
  search: string;
  statusFilter: 'all' | SdsStatus;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: 'all' | SdsStatus) => void;
};

function FilterBar({
  filterCounts,
  search,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
}: FilterBarProps) {
  return (
    <Card sx={{ p: 2, borderRadius: 3, border: '1px solid rgba(15,23,42,0.08)', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.03)' }}>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'stretch', lg: 'center' } }}>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }} useFlexGap>
          <Chip label={`${filterCounts.all} Total SDSs`} sx={chipBaseSx('var(--gpv-gray-100)')} />
          <Chip label={`${filterCounts.current} Current`} sx={chipBaseSx('rgba(46, 164, 79, 0.1)', '#16a34a')} />
          <Chip label={`${filterCounts.expiring_soon} Expiring soon`} sx={chipBaseSx('rgba(245, 158, 11, 0.12)', '#b45309')} />
          <Chip label={`${filterCounts.expired} Expired`} sx={chipBaseSx('rgba(225, 29, 72, 0.1)', '#be123c')} />
        </Stack>
        <Box sx={{ flex: 1 }} />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: { xs: '100%', lg: 'auto' } }}>
          <Box sx={{ position: 'relative', width: { xs: '100%', sm: 260 } }}>
            <SearchIcon sx={{ position: 'absolute', left: 10, top: 11, fontSize: 18, color: 'text.secondary', zIndex: 1 }} />
            <TextField
              size="small"
              placeholder="Search by product, CAS, supplier, or SDS ID"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              sx={{ width: '100%', '& .MuiInputBase-input': { pl: 4 } }}
            />
          </Box>
          <Select
            size="small"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as 'all' | SdsStatus)}
            sx={{ minWidth: 170 }}
          >
            <MenuItem value="all">All statuses</MenuItem>
            <MenuItem value="current">Current</MenuItem>
            <MenuItem value="expiring_soon">Expiring soon</MenuItem>
            <MenuItem value="expired">Expired</MenuItem>
          </Select>
        </Stack>
      </Stack>
    </Card>
  );
}

function ExpiredWarning({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <Box
      sx={{
        px: 2,
        py: 1.5,
        bgcolor: 'rgba(225, 29, 72, 0.08)',
        borderRadius: 3,
        border: '1px solid rgba(225, 29, 72, 0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        flexWrap: 'wrap',
      }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <WarningIcon sx={{ fontSize: 18, color: '#be123c' }} />
        <Typography sx={{ fontSize: 13, color: '#be123c', fontWeight: 500 }}>
          {count} SDS document{count === 1 ? '' : 's'} expired. Review them before using those chemicals operationally.
        </Typography>
      </Stack>
      <Typography sx={{ fontSize: 13, color: '#be123c', fontWeight: 700 }}>
        Review required
      </Typography>
    </Box>
  );
}

type ChemicalCardPreviewDialogProps = {
  open: boolean;
  html: string | null;
  frameRef: React.RefObject<HTMLIFrameElement | null>;
  onClose: () => void;
  onPrint: () => void;
};

function ChemicalCardPreviewDialog({
  open,
  html,
  frameRef,
  onClose,
  onPrint,
}: ChemicalCardPreviewDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>GPV A4 chemical card preview</DialogTitle>
      <DialogContent dividers sx={{ p: 0, bgcolor: '#e5e7eb' }}>
        {html && (
          <Box sx={{ height: '80vh', minHeight: 720 }}>
            <Box
              component="iframe"
              ref={frameRef}
              title="GPV A4 chemical card preview"
              srcDoc={html}
              sx={{ width: '100%', height: '100%', border: 0, bgcolor: 'white' }}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <ChemRegButton variant="outline" onClick={onClose}>
          Close
        </ChemRegButton>
        <ChemRegButton variant="primary" onClick={onPrint}>
          Print / Save PDF
        </ChemRegButton>
      </DialogActions>
    </Dialog>
  );
}
