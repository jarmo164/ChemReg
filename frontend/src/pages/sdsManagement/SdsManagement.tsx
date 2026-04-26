import {
  Alert,
  Box,
  Chip,
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
    setSearch,
    setStatusFilter,
    setField,
    loadDocuments,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    handleSubmit,
    handlePdfSelected,
    handleOpenFile,
    handleGenerateMiniSds,
    runPdfExtraction,
  } = useSdsManagement();

  return (
    <Box>
      <Header
        isLoading={isLoading}
        onRefresh={loadDocuments}
        onImport={openCreateDialog}
        onAdd={openCreateDialog}
      />

      <FilterBar
        filterCounts={filterCounts}
        search={search}
        statusFilter={statusFilter}
        onSearchChange={setSearch}
        onStatusFilterChange={setStatusFilter}
      />

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

      <ExpiredWarning count={filterCounts.expired} />

      <SdsTable
        rows={filteredDocuments}
        isLoading={isLoading}
        onView={openEditDialog}
        onOpenFile={(docId, fileId, mode) => void handleOpenFile(docId, fileId, mode)}
        onGenerateMiniSds={handleGenerateMiniSds}
      />

      <SdsDialog
        open={dialogOpen}
        mode={mode}
        selectedId={selectedId}
        selectedDocument={selectedDocument}
        form={form}
        generatedJson={generatedJson}
        isSaving={isSaving}
        isUploadingFile={isUploadingFile}
        extractionStatus={extractionStatus}
        extractionWarnings={extractionWarnings}
        fileInputRef={fileInputRef}
        onClose={closeDialog}
        onFieldChange={setField}
        onSubmit={() => void handleSubmit()}
        onPdfSelected={(e) => void handlePdfSelected(e)}
        onOpenFile={(docId, fileId, mode) => void handleOpenFile(docId, fileId, mode)}
        onGenerateMiniSds={handleGenerateMiniSds}
        onRunExtraction={(docId, fileId) => void runPdfExtraction(docId, fileId)}
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
    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Box>
        <Typography sx={{ fontSize: 24, fontWeight: 900, color: 'text.primary' }}>SDS Management</Typography>
        <Typography sx={{ mt: 0.5, fontSize: 13, color: 'text.secondary' }}>
          Live SDS register backed by tenant-scoped backend documents and sections.
        </Typography>
      </Box>
      <Stack direction="row" spacing={1}>
        <ChemRegButton variant="outline" onClick={() => void onRefresh()} disabled={isLoading}>
          <SyncIcon sx={{ fontSize: 16, mr: 0.5 }} />
          Refresh
        </ChemRegButton>
        <ChemRegButton variant="outline" onClick={onImport}>
          <ImportIcon sx={{ fontSize: 16, mr: 0.5 }} />
          Import SDS PDF
        </ChemRegButton>
        <ChemRegButton variant="primary" onClick={onAdd}>
          <AddIcon sx={{ fontSize: 16, mr: 0.5 }} />
          Add SDS
        </ChemRegButton>
      </Stack>
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
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{ width: 220, '& .MuiInputBase-input': { pl: 4 } }}
        />
      </Box>
      <Select
        size="small"
        value={statusFilter}
        onChange={(e) => onStatusFilterChange(e.target.value as 'all' | SdsStatus)}
        sx={{ minWidth: 120 }}
      >
        <MenuItem value="all">All</MenuItem>
        <MenuItem value="current">Current</MenuItem>
        <MenuItem value="expiring_soon">Expiring</MenuItem>
        <MenuItem value="expired">Expired</MenuItem>
      </Select>
    </Stack>
  );
}

function ExpiredWarning({ count }: { count: number }) {
  if (count === 0) return null;

  return (
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
          {count} SDS expired – associated chemical operations are restricted.
        </Typography>
      </Stack>
      <Typography sx={{ fontSize: 13, color: '#be123c', fontWeight: 700 }}>
        Review required
      </Typography>
    </Box>
  );
}