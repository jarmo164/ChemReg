import { useMemo, useState } from "react";
import {
  Box,
  Card,
  Chip,
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
} from "@mui/material";
import {
  Sync as SyncIcon,
  FileUpload as ImportIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import ChemRegButton from "../components/ChemRegButton";
import StatusChip from "../components/StatusChip";

type SdsStatus = "current" | "expiring_soon" | "expired";
type MiniSdsMode = "create" | "edit";
type BackendSdsStatus = "active" | "pending_review" | "archived";

type SdsListRow = {
  id: string;
  productName: string;
  casNumber: string;
  revision: string;
  supplierName: string;
  expiryDate: string;
  status: SdsStatus;
};

type MiniSdsForm = {
  productName: string;
  supplierNameRaw: string;
  supplierId: string;
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

type BackendSdsPayload = {
  document: {
    productName: string;
    supplierNameRaw: string;
    language: string;
    countryFormat: string;
    revisionDate: string | null;
    expiryDate: string | null;
    status: BackendSdsStatus;
  };
  supplierIds: string[];
  sections: Array<{
    sectionNumber: number;
    title: string;
    content: string;
  }>;
};

const supplierOptions = [
  { id: "supplier-sigma", name: "Sigma-Aldrich" },
  { id: "supplier-merck", name: "Merck KGaA" },
  { id: "supplier-thermo", name: "ThermoFisher Scientific" },
  { id: "supplier-air", name: "Air Products" },
];

const initialDocuments: SdsListRow[] = [
  {
    id: "SDS-001",
    productName: "Sodium Hydroxide",
    casNumber: "1310-73-2",
    revision: "2026-02-15",
    supplierName: "Sigma-Aldrich",
    expiryDate: "2026-09-15",
    status: "current",
  },
  {
    id: "SDS-002",
    productName: "Hydrochloric Acid 37%",
    casNumber: "7647-01-0",
    revision: "2026-01-04",
    supplierName: "Merck KGaA",
    expiryDate: "2026-04-01",
    status: "expiring_soon",
  },
  {
    id: "SDS-003",
    productName: "Acetone",
    casNumber: "67-64-1",
    revision: "2026-03-10",
    supplierName: "ThermoFisher Scientific",
    expiryDate: "2027-01-20",
    status: "current",
  },
  {
    id: "SDS-005",
    productName: "Sulfuric Acid 98%",
    casNumber: "7664-93-9",
    revision: "2025-01-15",
    supplierName: "Merck KGaA",
    expiryDate: "2026-01-15",
    status: "expired",
  },
];

const sectionDefinitions = [
  { key: "section1Identification", number: 1, title: "Identification" },
  { key: "section2Hazards", number: 2, title: "Hazard identification" },
  { key: "section3Composition", number: 3, title: "Composition / information on ingredients" },
  { key: "section4FirstAid", number: 4, title: "First aid measures" },
  { key: "section5Firefighting", number: 5, title: "Firefighting measures" },
  { key: "section6AccidentalRelease", number: 6, title: "Accidental release measures" },
  { key: "section7HandlingStorage", number: 7, title: "Handling and storage" },
  { key: "section8ExposureControl", number: 8, title: "Exposure controls / personal protection" },
] as const;

const createEmptyForm = (): MiniSdsForm => ({
  productName: "",
  supplierNameRaw: "",
  supplierId: "",
  language: "et",
  countryFormat: "EE",
  revisionDate: "",
  expiryDate: "",
  status: "active",
  section1Identification: "",
  section2Hazards: "",
  section3Composition: "",
  section4FirstAid: "",
  section5Firefighting: "",
  section6AccidentalRelease: "",
  section7HandlingStorage: "",
  section8ExposureControl: "",
});

const seededForms: Record<string, MiniSdsForm> = {
  "SDS-001": {
    productName: "Sodium Hydroxide",
    supplierNameRaw: "Sigma-Aldrich",
    supplierId: "supplier-sigma",
    language: "et",
    countryFormat: "EE",
    revisionDate: "2026-02-15",
    expiryDate: "2026-09-15",
    status: "active",
    section1Identification: "NaOH puhastus- ja neutraliseerimiskemikaal. Hädaabinumber +372 16662.",
    section2Hazards: "H314 Causes severe skin burns and eye damage. P280 Wear protective gloves and face protection.",
    section3Composition: "Sodium hydroxide, CAS 1310-73-2, EC 215-185-5, concentration 25-50%.",
    section4FirstAid: "Naha või silma sattumisel loputada koheselt rohke veega vähemalt 15 minutit.",
    section5Firefighting: "Toode ei põle, kuid tulekahju korral kasutada ümbruskonnale sobivaid kustutusvahendeid.",
    section6AccidentalRelease: "Piirata lekkepiirkond, kasutada keemiliselt vastupidavat absorbenti.",
    section7HandlingStorage: "Hoida korrosioonikindlas mahutis, vältida kokkupuudet hapetega.",
    section8ExposureControl: "Kaitseprillid, visiir, nitriilkindad, lokaalne väljatõmme.",
  },
  "SDS-002": {
    productName: "Hydrochloric Acid 37%",
    supplierNameRaw: "Merck KGaA",
    supplierId: "supplier-merck",
    language: "en",
    countryFormat: "EE",
    revisionDate: "2026-01-04",
    expiryDate: "2026-04-01",
    status: "pending_review",
    section1Identification: "Hydrochloric acid for process cleaning. Emergency phone +372 16662.",
    section2Hazards: "H290 May be corrosive to metals. H314 Causes severe skin burns and eye damage.",
    section3Composition: "Hydrogen chloride, CAS 7647-01-0, concentration 35-37%.",
    section4FirstAid: "Move exposed person to fresh air and flush affected area with water.",
    section5Firefighting: "Use water spray to cool containers. Product is not flammable.",
    section6AccidentalRelease: "Ventilate area and neutralize carefully with alkali absorbent.",
    section7HandlingStorage: "Store in corrosion-resistant container with resistant inner liner.",
    section8ExposureControl: "Chemical goggles, acid-resistant gloves, apron and local exhaust ventilation.",
  },
  "SDS-003": {
    productName: "Acetone",
    supplierNameRaw: "ThermoFisher Scientific",
    supplierId: "supplier-thermo",
    language: "et",
    countryFormat: "EE",
    revisionDate: "2026-03-10",
    expiryDate: "2027-01-20",
    status: "active",
    section1Identification: "Labori lahusti proovide ettevalmistuseks. Hädaabinumber +372 16662.",
    section2Hazards: "H225 Highly flammable liquid and vapour. H319 Causes serious eye irritation.",
    section3Composition: "Acetone, CAS 67-64-1, EC 200-662-2, concentration 95-100%.",
    section4FirstAid: "Viia kannatanu värske õhu kätte. Silma sattumisel loputada ettevaatlikult veega.",
    section5Firefighting: "Kasutada alkoholikindlat vahtu, CO2 või pulberkustutit.",
    section6AccidentalRelease: "Eemaldada süüteallikad, tagada ventilatsioon, absorbeerida inertse materjaliga.",
    section7HandlingStorage: "Hoida hästi ventileeritavas tuleohutuskapis, anum tihedalt suletud.",
    section8ExposureControl: "Nitriilkindad, kaitseprillid, kohtäratõmme.",
  },
  "SDS-005": {
    productName: "Sulfuric Acid 98%",
    supplierNameRaw: "Merck KGaA",
    supplierId: "supplier-merck",
    language: "en",
    countryFormat: "EE",
    revisionDate: "2025-01-15",
    expiryDate: "2026-01-15",
    status: "archived",
    section1Identification: "Sulfuric acid for lab and maintenance operations.",
    section2Hazards: "H290 May be corrosive to metals. H314 Causes severe skin burns and eye damage.",
    section3Composition: "Sulfuric acid, CAS 7664-93-9, EC 231-639-5, concentration 95-98%.",
    section4FirstAid: "Immediately flush skin and eyes with water. Get medical attention urgently.",
    section5Firefighting: "Not combustible, but reacts with many metals producing hydrogen.",
    section6AccidentalRelease: "Contain leak, dilute carefully and neutralize if trained to do so.",
    section7HandlingStorage: "Store locked up in acid-resistant containers away from bases.",
    section8ExposureControl: "Face shield, acid-resistant gloves, apron and ventilation.",
  },
};

const payloadFromForm = (form: MiniSdsForm): BackendSdsPayload => ({
  document: {
    productName: form.productName.trim(),
    supplierNameRaw: form.supplierNameRaw.trim(),
    language: form.language,
    countryFormat: form.countryFormat,
    revisionDate: form.revisionDate || null,
    expiryDate: form.expiryDate || null,
    status: form.status,
  },
  supplierIds: form.supplierId ? [form.supplierId] : [],
  sections: sectionDefinitions
    .map((section) => ({
      sectionNumber: section.number,
      title: section.title,
      content: form[section.key].trim(),
    }))
    .filter((section) => section.content.length > 0),
});

const rowStatusFromForm = (form: MiniSdsForm): SdsStatus => {
  if (!form.expiryDate) return "current";
  const expiry = new Date(form.expiryDate);
  const today = new Date();
  const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "expired";
  if (diffDays <= 30) return "expiring_soon";
  return "current";
};

export default function SdsManagement() {
  const [documents, setDocuments] = useState<SdsListRow[]>(initialDocuments);
  const [formsById, setFormsById] = useState<Record<string, MiniSdsForm>>(seededForms);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | SdsStatus>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState<MiniSdsMode>("create");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<MiniSdsForm>(createEmptyForm());
  const [generatedJson, setGeneratedJson] = useState<string>("");

  const filteredDocuments = useMemo(() => {
    return documents.filter((sds) => {
      const matchesSearch = [sds.id, sds.productName, sds.casNumber, sds.supplierName]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesFilter = statusFilter === "all" ? true : sds.status === statusFilter;
      return matchesSearch && matchesFilter;
    });
  }, [documents, search, statusFilter]);

  const filterCounts = useMemo(
    () => ({
      all: documents.length,
      current: documents.filter((s) => s.status === "current").length,
      expiring_soon: documents.filter((s) => s.status === "expiring_soon").length,
      expired: documents.filter((s) => s.status === "expired").length,
    }),
    [documents]
  );

  const openCreateDialog = () => {
    setMode("create");
    setSelectedId(null);
    setForm(createEmptyForm());
    setGeneratedJson("");
    setDialogOpen(true);
  };

  const openEditDialog = (id: string) => {
    const existing = formsById[id];
    if (!existing) return;
    setMode("edit");
    setSelectedId(id);
    setForm(existing);
    setGeneratedJson(JSON.stringify(payloadFromForm(existing), null, 2));
    setDialogOpen(true);
  };

  const closeDialog = () => setDialogOpen(false);

  const setField = (field: keyof MiniSdsForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = () => {
    const nextId = selectedId ?? `SDS-${String(documents.length + 1).padStart(3, "0")}`;
    const nextRow: SdsListRow = {
      id: nextId,
      productName: form.productName.trim(),
      casNumber: extractCasPreview(form.section3Composition),
      revision: form.revisionDate,
      supplierName: form.supplierNameRaw.trim(),
      expiryDate: form.expiryDate,
      status: rowStatusFromForm(form),
    };
    const payload = payloadFromForm(form);

    setFormsById((current) => ({ ...current, [nextId]: form }));
    setDocuments((current) => {
      if (selectedId) {
        return current.map((item) => (item.id === selectedId ? nextRow : item));
      }
      return [nextRow, ...current];
    });
    setSelectedId(nextId);
    setMode("edit");
    setGeneratedJson(JSON.stringify(payload, null, 2));
  };

  const expiredCount = filterCounts.expired;

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography sx={{ fontSize: 24, fontWeight: 900, color: "text.primary" }}>SDS Management</Typography>
          <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary" }}>
            Store, version, and manage Safety Data Sheets
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <ChemRegButton variant="outline">
            <SyncIcon sx={{ fontSize: 16, mr: 0.5 }} />
            Auto-sync
          </ChemRegButton>
          <ChemRegButton variant="outline">
            <ImportIcon sx={{ fontSize: 16, mr: 0.5 }} />
            Import SDS
          </ChemRegButton>
          <ChemRegButton variant="primary" onClick={openCreateDialog}>
            <AddIcon sx={{ fontSize: 16, mr: 0.5 }} />
            Add SDS
          </ChemRegButton>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mt: 3, alignItems: "center" }}>
        <Chip label={`${filterCounts.all} Total SDSs`} sx={chipBaseSx("var(--gpv-gray-100)")} />
        <Chip label={`${filterCounts.current} Current`} sx={chipBaseSx("rgba(46, 164, 79, 0.1)", "#16a34a")} />
        <Chip label={`${filterCounts.expiring_soon} Expiring (30 days)`} sx={chipBaseSx("rgba(245, 158, 11, 0.12)", "#b45309")} />
        <Chip label={`${filterCounts.expired} Expired`} sx={chipBaseSx("rgba(225, 29, 72, 0.1)", "#be123c")} />
        <Box sx={{ flex: 1 }} />
        <Box sx={{ position: "relative", width: 220 }}>
          <SearchIcon sx={{ position: "absolute", left: 10, top: 11, fontSize: 18, color: "text.secondary", zIndex: 1 }} />
          <TextField
            size="small"
            placeholder="Search SDS..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={{ width: 220, "& .MuiInputBase-input": { pl: 4 } }}
          />
        </Box>
        <Select size="small" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | SdsStatus)} sx={{ minWidth: 120 }}>
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="current">Current</MenuItem>
          <MenuItem value="expiring_soon">Expiring</MenuItem>
          <MenuItem value="expired">Expired</MenuItem>
        </Select>
      </Stack>

      {expiredCount > 0 && (
        <Box
          sx={{
            mt: 2,
            px: 2,
            py: 1.5,
            bgcolor: "rgba(225, 29, 72, 0.08)",
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <WarningIcon sx={{ fontSize: 18, color: "#be123c" }} />
            <Typography sx={{ fontSize: 13, color: "#be123c", fontWeight: 500 }}>
              {expiredCount} SDS expired – associated chemical operations are restricted.
            </Typography>
          </Stack>
          <Typography sx={{ fontSize: 13, color: "#be123c", fontWeight: 700, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>
            Renew All
          </Typography>
        </Box>
      )}

      <Card sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "var(--gpv-gray-100)" }}>
              {[
                "SDS ID",
                "Chemical Name",
                "CAS Number",
                "Revision",
                "Manufacturer",
                "Expiry Date",
                "Status",
                "Actions",
              ].map((label) => (
                <TableCell key={label} sx={tableHeadCellSx}>
                  {label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDocuments.map((sds) => (
              <TableRow key={sds.id} hover>
                <TableCell><Typography sx={{ fontSize: 13, fontWeight: 600, color: "var(--gpv-primary-500)" }}>{sds.id}</Typography></TableCell>
                <TableCell><Typography sx={{ fontSize: 13, fontWeight: 500 }}>{sds.productName}</Typography></TableCell>
                <TableCell><Typography sx={{ fontSize: 13, color: "text.secondary" }}>{sds.casNumber || "—"}</Typography></TableCell>
                <TableCell><Typography sx={{ fontSize: 13, color: "text.secondary" }}>{sds.revision || "—"}</Typography></TableCell>
                <TableCell><Typography sx={{ fontSize: 13, color: "text.secondary" }}>{sds.supplierName}</Typography></TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: 13, color: sds.status === "expired" ? "#be123c" : "text.secondary", fontWeight: sds.status === "expired" ? 600 : 400 }}>
                    {sds.expiryDate || "—"}
                  </Typography>
                </TableCell>
                <TableCell><StatusChip status={sds.status} /></TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                    <IconButton size="small" sx={{ color: "text.secondary" }} onClick={() => openEditDialog(sds.id)}>
                      <ViewIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                    <IconButton size="small" sx={{ color: "text.secondary" }} onClick={() => openEditDialog(sds.id)}>
                      <DownloadIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
            <Box>
              <Typography sx={{ fontSize: 22, fontWeight: 800 }}>
                {mode === "create" ? "Create mini SDS" : `Edit mini SDS • ${selectedId}`}
              </Typography>
              <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary" }}>
                Mini SDS is embedded into ChemReg SDS Management and generates backend-aligned SDS document payload.
              </Typography>
            </Box>
            <IconButton onClick={closeDialog}><CloseIcon /></IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <Card variant="outlined" sx={{ p: 2.5 }}>
              <Typography sx={{ fontSize: 16, fontWeight: 800, mb: 2 }}>Document metadata</Typography>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ flexWrap: "wrap" }} useFlexGap>
                <TextField label="Product name" value={form.productName} onChange={(e) => setField("productName", e.target.value)} required fullWidth />
                <TextField label="Supplier name" value={form.supplierNameRaw} onChange={(e) => setField("supplierNameRaw", e.target.value)} fullWidth />
                <TextField select label="Linked supplier" value={form.supplierId} onChange={(e) => setField("supplierId", e.target.value)} fullWidth>
                  <MenuItem value="">No linked supplier</MenuItem>
                  {supplierOptions.map((supplier) => (
                    <MenuItem key={supplier.id} value={supplier.id}>{supplier.name}</MenuItem>
                  ))}
                </TextField>
                <TextField label="Revision date (YYYY-MM-DD)" type="date" value={form.revisionDate} onChange={(e) => setField("revisionDate", e.target.value)} fullWidth />
                <TextField label="Expiry date (YYYY-MM-DD)" type="date" value={form.expiryDate} onChange={(e) => setField("expiryDate", e.target.value)} fullWidth />
                <TextField label="Language" value={form.language} onChange={(e) => setField("language", e.target.value)} fullWidth />
                <TextField label="Country format" value={form.countryFormat} onChange={(e) => setField("countryFormat", e.target.value)} fullWidth />
                <TextField select label="Document status" value={form.status} onChange={(e) => setField("status", e.target.value)} fullWidth>
                  <MenuItem value="active">active</MenuItem>
                  <MenuItem value="pending_review">pending_review</MenuItem>
                  <MenuItem value="archived">archived</MenuItem>
                </TextField>
              </Stack>
            </Card>

            <Card variant="outlined" sx={{ p: 2.5 }}>
              <Typography sx={{ fontSize: 16, fontWeight: 800, mb: 1 }}>Mini SDS sections</Typography>
              <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 2 }}>
                Keep the content concise. JSON is generated directly into `sds_documents + sds_sections + sds_supplier_links`-friendly structure.
              </Typography>
              <Stack spacing={2}>
                {sectionDefinitions.map((section) => (
                  <Box key={section.key}>
                    <Typography sx={{ mb: 1, fontSize: 13, fontWeight: 700, color: "text.secondary", textTransform: "uppercase" }}>
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
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Box>
                  <Typography sx={{ fontSize: 16, fontWeight: 800 }}>Generated backend JSON</Typography>
                  <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                    Uses backend model shape: `document`, `supplierIds`, `sections`.
                  </Typography>
                </Box>
                <ChemRegButton variant="primary" onClick={handleSubmit}>
                  Save & generate JSON
                </ChemRegButton>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              <Box component="pre" sx={{ m: 0, p: 2, borderRadius: 2, bgcolor: "#0f172a", color: "#d1fae5", overflowX: "auto", fontSize: 12, lineHeight: 1.6 }}>
                {generatedJson || JSON.stringify(payloadFromForm(form), null, 2)}
              </Box>
            </Card>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

function chipBaseSx(bgcolor: string, color = "text.primary") {
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
  color: "text.secondary",
  textTransform: "uppercase",
};

function extractCasPreview(compositionText: string) {
  const match = compositionText.match(/\b\d{2,7}-\d{2}-\d\b/);
  return match?.[0] ?? "";
}
