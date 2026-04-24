import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
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
  Add as AddIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  WarningAmber as WarningAmberIcon,
} from '@mui/icons-material';
import ChemRegButton from '../components/ChemRegButton';
import {
  createChemicalProduct,
  deleteChemicalProduct,
  listChemicalProducts,
  updateChemicalProduct,
  type ChemicalProduct,
  type ChemicalSignalWord,
  type PhysicalState,
  type SaveChemicalProductRequest,
} from '../api/chemicals';
import { listSdsDocuments, type SdsDocument } from '../api/sds';

type FilterSignalWord = 'all' | ChemicalSignalWord | 'none';
type ChemicalForm = {
  name: string;
  casNumber: string;
  ecNumber: string;
  signalWord: '' | ChemicalSignalWord;
  physicalState: '' | PhysicalState;
  restricted: 'true' | 'false';
  sdsDocumentId: string;
};

const emptyForm = (): ChemicalForm => ({
  name: '',
  casNumber: '',
  ecNumber: '',
  signalWord: '',
  physicalState: '',
  restricted: 'false',
  sdsDocumentId: '',
});

const signalWordOptions: ChemicalSignalWord[] = ['Danger', 'Warning'];
const physicalStateOptions: PhysicalState[] = ['solid', 'liquid', 'gas', 'aerosol'];

export default function ChemicalRegister() {
  const [chemicals, setChemicals] = useState<ChemicalProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [sdsDocuments, setSdsDocuments] = useState<SdsDocument[]>([]);
  const [search, setSearch] = useState('');
  const [signalWordFilter, setSignalWordFilter] = useState<FilterSignalWord>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingChemical, setEditingChemical] = useState<ChemicalProduct | null>(null);
  const [form, setForm] = useState<ChemicalForm>(emptyForm());

  async function loadChemicals() {
    setIsLoading(true);
    setError('');

    try {
      const [chemicalData, sdsData] = await Promise.all([
        listChemicalProducts(),
        listSdsDocuments(),
      ]);
      setChemicals(chemicalData);
      setSdsDocuments(sdsData);
    } catch (err) {
      const nextError = err as Error;
      setError(nextError.message || 'Failed to load chemical register');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadChemicals();
  }, []);

  const filteredChemicals = useMemo(() => {
    return chemicals.filter((chemical) => {
      const matchesSearch = [chemical.name, chemical.casNumber, chemical.ecNumber, chemical.physicalState, chemical.signalWord]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesSignalWord =
        signalWordFilter === 'all'
          ? true
          : signalWordFilter === 'none'
            ? !chemical.signalWord
            : chemical.signalWord === signalWordFilter;

      return matchesSearch && matchesSignalWord;
    });
  }, [chemicals, search, signalWordFilter]);

  const restrictedCount = chemicals.filter((chemical) => chemical.restricted).length;
  const linkedSdsCount = chemicals.filter((chemical) => chemical.sdsDocumentId).length;

  function openCreateDialog() {
    setEditingChemical(null);
    setForm(emptyForm());
    setDialogOpen(true);
  }

  function openEditDialog(chemical: ChemicalProduct) {
    setEditingChemical(chemical);
    setForm({
      name: chemical.name,
      casNumber: chemical.casNumber ?? '',
      ecNumber: chemical.ecNumber ?? '',
      signalWord: chemical.signalWord ?? '',
      physicalState: chemical.physicalState ?? '',
      restricted: chemical.restricted ? 'true' : 'false',
      sdsDocumentId: chemical.sdsDocumentId ?? '',
    });
    setDialogOpen(true);
  }

  function closeDialog() {
    if (isSaving) return;
    setDialogOpen(false);
  }

  function setField<K extends keyof ChemicalForm>(field: K, value: ChemicalForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toPayload(currentForm: ChemicalForm): SaveChemicalProductRequest {
    return {
      name: currentForm.name.trim(),
      casNumber: currentForm.casNumber.trim() || null,
      ecNumber: currentForm.ecNumber.trim() || null,
      signalWord: currentForm.signalWord || null,
      physicalState: currentForm.physicalState || null,
      restricted: currentForm.restricted === 'true',
      sdsDocumentId: currentForm.sdsDocumentId || null,
    };
  }

  async function handleSubmit() {
    if (!form.name.trim()) {
      setError('Chemical name is required');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      if (editingChemical) {
        const updated = await updateChemicalProduct(editingChemical.id, toPayload(form));
        setChemicals((current) => current.map((chemical) => (chemical.id === updated.id ? updated : chemical)));
      } else {
        const created = await createChemicalProduct(toPayload(form));
        setChemicals((current) => [created, ...current]);
      }

      setDialogOpen(false);
    } catch (err) {
      const nextError = err as Error;
      setError(nextError.message || 'Saving chemical failed');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(chemical: ChemicalProduct) {
    const confirmed = window.confirm(`Delete chemical “${chemical.name}”?`);
    if (!confirmed) return;

    setError('');

    try {
      await deleteChemicalProduct(chemical.id);
      setChemicals((current) => current.filter((item) => item.id !== chemical.id));
    } catch (err) {
      const nextError = err as Error;
      setError(nextError.message || 'Deleting chemical failed');
    }
  }

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography sx={{ fontSize: 24, fontWeight: 900, color: 'text.primary' }}>Chemical Register</Typography>
          <Typography sx={{ mt: 0.5, fontSize: 13, color: 'text.secondary' }}>
            Live tenant-scoped chemical product registry backed by the API, with SDS linking from real documents.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <ChemRegButton variant="outline" onClick={() => void loadChemicals()} disabled={isLoading}>
            <RefreshIcon sx={{ fontSize: 16, mr: 0.5 }} />
            Refresh
          </ChemRegButton>
          <ChemRegButton variant="primary" onClick={openCreateDialog}>
            <AddIcon sx={{ fontSize: 16, mr: 0.5 }} />
            Add chemical
          </ChemRegButton>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mt: 3, alignItems: 'center', flexWrap: 'wrap' }} useFlexGap>
        <Chip label={`${chemicals.length} Total`} sx={chipBaseSx('var(--gpv-gray-100)')} />
        <Chip label={`${restrictedCount} Restricted`} sx={chipBaseSx('rgba(225, 29, 72, 0.1)', '#be123c')} />
        <Chip label={`${linkedSdsCount} Linked to SDS`} sx={chipBaseSx('rgba(59, 130, 246, 0.12)', '#1d4ed8')} />
        <Chip
          label={`${chemicals.filter((chemical) => chemical.signalWord === 'Danger').length} Danger`}
          sx={chipBaseSx('rgba(245, 158, 11, 0.16)', '#b45309')}
        />
        <Box sx={{ flex: 1 }} />
        <Box sx={{ position: 'relative', width: 240 }}>
          <SearchIcon sx={{ position: 'absolute', left: 10, top: 11, fontSize: 18, color: 'text.secondary', zIndex: 1 }} />
          <TextField
            size="small"
            placeholder="Search chemicals..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={{ width: 240, '& .MuiInputBase-input': { pl: 4 } }}
          />
        </Box>
        <Select
          size="small"
          value={signalWordFilter}
          onChange={(event) => setSignalWordFilter(event.target.value as FilterSignalWord)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="all">All signal words</MenuItem>
          <MenuItem value="Danger">Danger</MenuItem>
          <MenuItem value="Warning">Warning</MenuItem>
          <MenuItem value="none">No signal word</MenuItem>
        </Select>
      </Stack>

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

      {restrictedCount > 0 && (
        <Box
          sx={{
            mt: 2,
            px: 2,
            py: 1.5,
            bgcolor: 'rgba(245, 158, 11, 0.12)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <WarningAmberIcon sx={{ fontSize: 18, color: '#b45309' }} />
          <Typography sx={{ fontSize: 13, color: '#92400e', fontWeight: 500 }}>
            Restricted chemicals are visible. Link them to the correct SDS where available so downstream inventory and risk flows inherit the right document context.
          </Typography>
        </Box>
      )}

      <Card sx={{ mt: 2, minHeight: 320, display: 'flex', alignItems: isLoading ? 'center' : 'stretch', justifyContent: 'center' }}>
        {isLoading ? (
          <Stack spacing={1} sx={{ alignItems: 'center', py: 6 }}>
            <CircularProgress size={28} />
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Loading chemical register…</Typography>
          </Stack>
        ) : filteredChemicals.length === 0 ? (
          <Stack spacing={1} sx={{ alignItems: 'center', py: 6 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 700 }}>No chemicals found</Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
              Add the first chemical product or adjust the current filters.
            </Typography>
          </Stack>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'var(--gpv-gray-100)' }}>
                {['Chemical', 'CAS', 'EC', 'Signal word', 'State', 'Restricted', 'SDS', 'Updated', 'Actions'].map((label) => (
                  <TableCell key={label} sx={tableHeadCellSx}>{label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredChemicals.map((chemical) => (
                <TableRow key={chemical.id} hover>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{chemical.name}</Typography>
                      <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{chemical.id}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell><Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{chemical.casNumber || '—'}</Typography></TableCell>
                  <TableCell><Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{chemical.ecNumber || '—'}</Typography></TableCell>
                  <TableCell>
                    <Chip
                      label={chemical.signalWord || 'None'}
                      size="small"
                      sx={chemical.signalWord === 'Danger' ? chipBaseSx('rgba(225, 29, 72, 0.1)', '#be123c') : chemical.signalWord === 'Warning' ? chipBaseSx('rgba(245, 158, 11, 0.12)', '#b45309') : chipBaseSx('var(--gpv-gray-100)')}
                    />
                  </TableCell>
                  <TableCell><Typography sx={{ fontSize: 13, color: 'text.secondary', textTransform: 'capitalize' }}>{chemical.physicalState || '—'}</Typography></TableCell>
                  <TableCell>
                    <Chip label={chemical.restricted ? 'Restricted' : 'Open'} size="small" sx={chemical.restricted ? chipBaseSx('rgba(225, 29, 72, 0.1)', '#be123c') : chipBaseSx('rgba(46, 164, 79, 0.1)', '#15803d')} />
                  </TableCell>
                  <TableCell><Typography sx={{ fontSize: 13, color: chemical.sdsDocumentId ? '#15803d' : 'text.secondary', fontWeight: chemical.sdsDocumentId ? 700 : 400 }}>{chemical.sdsDocumentId ? 'Linked' : 'Not linked'}</Typography></TableCell>
                  <TableCell><Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{formatDateTime(chemical.updatedAt)}</Typography></TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      <IconButton size="small" sx={{ color: 'text.secondary' }} onClick={() => openEditDialog(chemical)}>
                        <EditIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                      <IconButton size="small" sx={{ color: '#be123c' }} onClick={() => void handleDelete(chemical)}>
                        <DeleteIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography sx={{ fontSize: 22, fontWeight: 800 }}>
                {editingChemical ? `Edit chemical • ${editingChemical.name}` : 'Add chemical'}
              </Typography>
              <Typography sx={{ mt: 0.5, fontSize: 13, color: 'text.secondary' }}>
                This writes directly to the backend chemical product API for the current tenant.
              </Typography>
            </Box>
            <IconButton onClick={closeDialog}><CloseIcon /></IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            <TextField label="Chemical name" value={form.name} onChange={(event) => setField('name', event.target.value)} required fullWidth />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="CAS number" value={form.casNumber} onChange={(event) => setField('casNumber', event.target.value)} fullWidth />
              <TextField label="EC number" value={form.ecNumber} onChange={(event) => setField('ecNumber', event.target.value)} fullWidth />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField select label="Signal word" value={form.signalWord} onChange={(event) => setField('signalWord', event.target.value as ChemicalForm['signalWord'])} fullWidth>
                <MenuItem value="">None</MenuItem>
                {signalWordOptions.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </TextField>
              <TextField select label="Physical state" value={form.physicalState} onChange={(event) => setField('physicalState', event.target.value as ChemicalForm['physicalState'])} fullWidth>
                <MenuItem value="">Not set</MenuItem>
                {physicalStateOptions.map((option) => (
                  <MenuItem key={option} value={option} sx={{ textTransform: 'capitalize' }}>{option}</MenuItem>
                ))}
              </TextField>
            </Stack>
            <TextField select label="Restriction level" value={form.restricted} onChange={(event) => setField('restricted', event.target.value as ChemicalForm['restricted'])} fullWidth>
              <MenuItem value="false">Open</MenuItem>
              <MenuItem value="true">Restricted</MenuItem>
            </TextField>
            <TextField
              select
              label="Linked SDS"
              value={form.sdsDocumentId}
              onChange={(event) => setField('sdsDocumentId', event.target.value)}
              fullWidth
              helperText={sdsDocuments.length === 0 ? 'No SDS documents available for linking yet.' : 'Optional, but recommended for traceability.'}
            >
              <MenuItem value="">Not linked</MenuItem>
              {sdsDocuments.map((document) => (
                <MenuItem key={document.id} value={document.id}>
                  {document.productName} {document.revisionDate ? `• ${document.revisionDate}` : ''}
                </MenuItem>
              ))}
            </TextField>
            <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
              <ChemRegButton variant="primary" onClick={() => void handleSubmit()} disabled={isSaving}>
                {isSaving ? 'Saving…' : editingChemical ? 'Save changes' : 'Create chemical'}
              </ChemRegButton>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
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

function formatDateTime(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
