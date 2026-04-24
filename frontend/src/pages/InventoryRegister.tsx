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
  Inventory2 as InventoryIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import ChemRegButton from '../components/ChemRegButton';
import { listChemicalProducts, type ChemicalProduct, type InventoryUnit } from '../api/chemicals';
import {
  createInventoryItem,
  deleteInventoryItem,
  listInventoryItems,
  updateInventoryItem,
  type InventoryItem,
  type InventoryStatus,
  type SaveInventoryItemRequest,
} from '../api/inventory';
import { listLocations, listSites, type Location, type Site } from '../api/sites';

type InventoryForm = {
  productId: string;
  siteId: string;
  locationId: string;
  quantity: string;
  unit: '' | InventoryUnit;
  containerType: string;
  lotNumber: string;
  status: InventoryStatus;
  minStock: string;
  expiryDate: string;
  openedAt: string;
};

const inventoryStatuses: InventoryStatus[] = ['in_stock', 'reserved', 'disposed', 'expired'];
const inventoryUnits: InventoryUnit[] = ['kg', 'L', 'g', 'mL', 'pcs'];

const emptyForm = (): InventoryForm => ({
  productId: '',
  siteId: '',
  locationId: '',
  quantity: '',
  unit: '',
  containerType: '',
  lotNumber: '',
  status: 'in_stock',
  minStock: '',
  expiryDate: '',
  openedAt: '',
});

export default function InventoryRegister() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [chemicals, setChemicals] = useState<ChemicalProduct[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | InventoryStatus>('all');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState<InventoryForm>(emptyForm());

  async function loadInventory() {
    setIsLoading(true);
    setError('');

    try {
      const [inventoryData, chemicalData, siteData] = await Promise.all([
        listInventoryItems(),
        listChemicalProducts(),
        listSites(),
      ]);

      setItems(inventoryData);
      setChemicals(chemicalData);
      setSites(siteData);

      const initialSiteId = selectedSiteId || siteData[0]?.id || '';
      if (initialSiteId) {
        setSelectedSiteId(initialSiteId);
        const locationData = await listLocations(initialSiteId);
        setLocations(locationData);
      } else {
        setLocations([]);
      }
    } catch (err) {
      const nextError = err as Error;
      setError(nextError.message || 'Failed to load inventory register');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedSiteId) {
      setLocations([]);
      return;
    }

    void (async () => {
      try {
        const locationData = await listLocations(selectedSiteId);
        setLocations(locationData);
      } catch (err) {
        const nextError = err as Error;
        setError(nextError.message || 'Failed to load locations');
      }
    })();
  }, [selectedSiteId]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = [item.productName, item.locationName, item.lotNumber, item.containerType, item.unit, item.status]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' ? true : item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [items, search, statusFilter]);

  const lowStockCount = items.filter((item) => item.minStock && Number(item.quantity) <= Number(item.minStock)).length;

  function openCreateDialog() {
    setEditingItem(null);
    setForm({ ...emptyForm(), siteId: selectedSiteId });
    setDialogOpen(true);
  }

  async function openEditDialog(item: InventoryItem) {
    let matchingLocation = locations.find((location) => location.id === item.locationId);
    let resolvedSiteId = matchingLocation?.siteId || selectedSiteId || '';

    if (!matchingLocation) {
      for (const site of sites) {
        const siteLocations = await listLocations(site.id);
        const found = siteLocations.find((location) => location.id === item.locationId);
        if (found) {
          matchingLocation = found;
          resolvedSiteId = site.id;
          setLocations(siteLocations);
          setSelectedSiteId(site.id);
          break;
        }
      }
    }

    setEditingItem(item);
    setForm({
      productId: item.productId,
      siteId: resolvedSiteId,
      locationId: item.locationId,
      quantity: String(item.quantity),
      unit: item.unit,
      containerType: item.containerType ?? '',
      lotNumber: item.lotNumber ?? '',
      status: item.status,
      minStock: item.minStock ? String(item.minStock) : '',
      expiryDate: item.expiryDate ?? '',
      openedAt: item.openedAt ? item.openedAt.slice(0, 16) : '',
    });
    setDialogOpen(true);
  }

  function closeDialog() {
    if (!isSaving) {
      setDialogOpen(false);
    }
  }

  function setField<K extends keyof InventoryForm>(field: K, value: InventoryForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSiteChange(siteId: string) {
    setSelectedSiteId(siteId);
    setField('siteId', siteId);
    setField('locationId', '');
    if (!siteId) {
      setLocations([]);
      return;
    }
    try {
      const locationData = await listLocations(siteId);
      setLocations(locationData);
    } catch (err) {
      const nextError = err as Error;
      setError(nextError.message || 'Failed to load locations');
    }
  }

  function toPayload(currentForm: InventoryForm): SaveInventoryItemRequest {
    return {
      productId: currentForm.productId,
      locationId: currentForm.locationId,
      quantity: Number(currentForm.quantity),
      unit: currentForm.unit || 'pcs',
      containerType: currentForm.containerType.trim() || null,
      lotNumber: currentForm.lotNumber.trim() || null,
      status: currentForm.status,
      minStock: currentForm.minStock ? Number(currentForm.minStock) : null,
      expiryDate: currentForm.expiryDate || null,
      openedAt: currentForm.openedAt ? new Date(currentForm.openedAt).toISOString() : null,
    };
  }

  async function handleSubmit() {
    if (!form.productId || !form.locationId || !form.quantity || !form.unit) {
      setError('Product, location, quantity and unit are required');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const saved = editingItem
        ? await updateInventoryItem(editingItem.id, toPayload(form))
        : await createInventoryItem(toPayload(form));

      setItems((current) => {
        if (editingItem) {
          return current.map((item) => (item.id === saved.id ? saved : item));
        }
        return [saved, ...current];
      });
      setDialogOpen(false);
    } catch (err) {
      const nextError = err as Error;
      setError(nextError.message || 'Saving inventory item failed');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(item: InventoryItem) {
    if (!window.confirm(`Delete inventory item for “${item.productName}” at “${item.locationName}”?`)) {
      return;
    }

    try {
      await deleteInventoryItem(item.id);
      setItems((current) => current.filter((candidate) => candidate.id !== item.id));
    } catch (err) {
      const nextError = err as Error;
      setError(nextError.message || 'Deleting inventory item failed');
    }
  }

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography sx={{ fontSize: 24, fontWeight: 900, color: 'text.primary' }}>Inventory Register</Typography>
          <Typography sx={{ mt: 0.5, fontSize: 13, color: 'text.secondary' }}>
            Live inventory view backed by real product, site, and location records.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <ChemRegButton variant="outline" onClick={() => void loadInventory()} disabled={isLoading}>
            <RefreshIcon sx={{ fontSize: 16, mr: 0.5 }} />
            Refresh
          </ChemRegButton>
          <ChemRegButton variant="primary" onClick={openCreateDialog}>
            <AddIcon sx={{ fontSize: 16, mr: 0.5 }} />
            Add inventory item
          </ChemRegButton>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mt: 3, alignItems: 'center', flexWrap: 'wrap' }} useFlexGap>
        <Chip label={`${items.length} Total items`} sx={chipBaseSx('var(--gpv-gray-100)')} />
        <Chip label={`${lowStockCount} Low stock`} sx={chipBaseSx('rgba(245, 158, 11, 0.12)', '#b45309')} />
        <Chip label={`${items.filter((item) => item.status === 'reserved').length} Reserved`} sx={chipBaseSx('rgba(59, 130, 246, 0.12)', '#1d4ed8')} />
        <Chip label={`${sites.length} Sites`} sx={chipBaseSx('rgba(16, 185, 129, 0.12)', '#047857')} />
        <Box sx={{ flex: 1 }} />
        <Box sx={{ position: 'relative', width: 240 }}>
          <SearchIcon sx={{ position: 'absolute', left: 10, top: 11, fontSize: 18, color: 'text.secondary', zIndex: 1 }} />
          <TextField
            size="small"
            placeholder="Search inventory..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={{ width: 240, '& .MuiInputBase-input': { pl: 4 } }}
          />
        </Box>
        <Select size="small" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'all' | InventoryStatus)} sx={{ minWidth: 160 }}>
          <MenuItem value="all">All statuses</MenuItem>
          {inventoryStatuses.map((status) => (
            <MenuItem key={status} value={status}>{formatStatus(status)}</MenuItem>
          ))}
        </Select>
      </Stack>

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

      <Card sx={{ mt: 2, minHeight: 320, display: 'flex', alignItems: isLoading ? 'center' : 'stretch', justifyContent: 'center' }}>
        {isLoading ? (
          <Stack spacing={1} sx={{ alignItems: 'center', py: 6 }}>
            <CircularProgress size={28} />
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Loading inventory register…</Typography>
          </Stack>
        ) : filteredItems.length === 0 ? (
          <Stack spacing={1} sx={{ alignItems: 'center', py: 6 }}>
            <InventoryIcon sx={{ fontSize: 36, color: 'text.disabled' }} />
            <Typography sx={{ fontSize: 16, fontWeight: 700 }}>No inventory items found</Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
              Add the first item or adjust the current filters.
            </Typography>
          </Stack>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'var(--gpv-gray-100)' }}>
                {['Chemical', 'Location', 'Quantity', 'Status', 'Container / lot', 'Expiry', 'Updated', 'Actions'].map((label) => (
                  <TableCell key={label} sx={tableHeadCellSx}>{label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems.map((item) => {
                const isLowStock = item.minStock && Number(item.quantity) <= Number(item.minStock);
                return (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{item.productName}</Typography>
                        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{item.id}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{item.locationName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{item.quantity} {item.unit}</Typography>
                        <Typography sx={{ fontSize: 11, color: isLowStock ? '#b45309' : 'text.disabled' }}>
                          {item.minStock ? `Min ${item.minStock} ${item.unit}` : 'No min stock'}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip label={formatStatus(item.status)} size="small" sx={statusChipSx(item.status)} />
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{item.containerType || '—'}</Typography>
                        <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>{item.lotNumber || 'No lot number'}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{item.expiryDate || '—'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{formatDateTime(item.updatedAt)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <IconButton size="small" onClick={() => void openEditDialog(item)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => void handleDelete(item)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
        <DialogTitle sx={{ pb: 1.5 }}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography sx={{ fontSize: 20, fontWeight: 800 }}>
                {editingItem ? 'Edit inventory item' : 'Add inventory item'}
              </Typography>
              <Typography sx={{ mt: 0.5, fontSize: 13, color: 'text.secondary' }}>
                This writes directly to the live inventory backend API.
              </Typography>
            </Box>
            <IconButton onClick={closeDialog}><CloseIcon /></IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField select label="Chemical product" value={form.productId} onChange={(event) => setField('productId', event.target.value)} fullWidth>
                <MenuItem value="">Select product</MenuItem>
                {chemicals.map((chemical) => (
                  <MenuItem key={chemical.id} value={chemical.id}>{chemical.name}</MenuItem>
                ))}
              </TextField>
              <TextField select label="Site" value={form.siteId} onChange={(event) => void handleSiteChange(event.target.value)} fullWidth>
                <MenuItem value="">Select site</MenuItem>
                {sites.map((site) => (
                  <MenuItem key={site.id} value={site.id}>{site.name}</MenuItem>
                ))}
              </TextField>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField select label="Location" value={form.locationId} onChange={(event) => setField('locationId', event.target.value)} fullWidth>
                <MenuItem value="">Select location</MenuItem>
                {locations.map((location) => (
                  <MenuItem key={location.id} value={location.id}>{location.name}</MenuItem>
                ))}
              </TextField>
              <TextField select label="Status" value={form.status} onChange={(event) => setField('status', event.target.value as InventoryStatus)} fullWidth>
                {inventoryStatuses.map((status) => (
                  <MenuItem key={status} value={status}>{formatStatus(status)}</MenuItem>
                ))}
              </TextField>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Quantity" type="number" value={form.quantity} onChange={(event) => setField('quantity', event.target.value)} fullWidth />
              <TextField select label="Unit" value={form.unit} onChange={(event) => setField('unit', event.target.value as InventoryForm['unit'])} fullWidth>
                <MenuItem value="">Select unit</MenuItem>
                {inventoryUnits.map((unit) => (
                  <MenuItem key={unit} value={unit}>{unit}</MenuItem>
                ))}
              </TextField>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Container type" value={form.containerType} onChange={(event) => setField('containerType', event.target.value)} fullWidth />
              <TextField label="Lot number" value={form.lotNumber} onChange={(event) => setField('lotNumber', event.target.value)} fullWidth />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Minimum stock" type="number" value={form.minStock} onChange={(event) => setField('minStock', event.target.value)} fullWidth />
              <TextField label="Expiry date" type="date" value={form.expiryDate} onChange={(event) => setField('expiryDate', event.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
            </Stack>
            <TextField label="Opened at" type="datetime-local" value={form.openedAt} onChange={(event) => setField('openedAt', event.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
            <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
              <ChemRegButton variant="primary" onClick={() => void handleSubmit()} disabled={isSaving}>
                {isSaving ? 'Saving…' : editingItem ? 'Save changes' : 'Create item'}
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

function statusChipSx(status: InventoryStatus) {
  switch (status) {
    case 'in_stock':
      return chipBaseSx('rgba(46, 164, 79, 0.1)', '#15803d');
    case 'reserved':
      return chipBaseSx('rgba(59, 130, 246, 0.12)', '#1d4ed8');
    case 'disposed':
      return chipBaseSx('rgba(107, 114, 128, 0.12)', '#4b5563');
    case 'expired':
      return chipBaseSx('rgba(225, 29, 72, 0.1)', '#be123c');
  }
}

const tableHeadCellSx = {
  fontWeight: 700,
  fontSize: 11,
  color: 'text.secondary',
  textTransform: 'uppercase',
};

function formatStatus(status: InventoryStatus) {
  return status.replace(/_/g, ' ');
}

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
