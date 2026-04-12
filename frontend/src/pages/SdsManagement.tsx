import {
  Box,
  Card,
  Chip,
  IconButton,
  InputAdornment,
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
} from "@mui/icons-material";
import { sdsDocuments } from "../data/mockData";
import StatusChip from "../components/StatusChip";
import ChemRegButton from "../components/ChemRegButton";

const filterCounts = {
  all: sdsDocuments.length,
  current: sdsDocuments.filter((s) => s.status === "current").length,
  expiring_soon: sdsDocuments.filter((s) => s.status === "expiring_soon").length,
  expired: sdsDocuments.filter((s) => s.status === "expired").length,
};

const expiredCount = filterCounts.expired;

export default function SdsManagement() {
  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography sx={{ fontSize: 24, fontWeight: 900, color: "text.primary" }}>
            SDS Management
          </Typography>
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
          <ChemRegButton variant="primary">
            <AddIcon sx={{ fontSize: 16, mr: 0.5 }} />
            Add SDS
          </ChemRegButton>
        </Stack>
      </Stack>

      {/* Filter chips */}
      <Stack direction="row" spacing={1} sx={{ mt: 3 }} alignItems="center">
        <Chip
          label={`${filterCounts.all} Total SDSs`}
          sx={{
            bgcolor: "var(--gpv-gray-100)",
            fontWeight: 600,
            fontSize: 12,
          }}
        />
        <Chip
          label={`${filterCounts.current} Current`}
          sx={{
            bgcolor: "rgba(46, 164, 79, 0.1)",
            color: "#16a34a",
            fontWeight: 600,
            fontSize: 12,
          }}
        />
        <Chip
          label={`${filterCounts.expiring_soon} Expiring (30 days)`}
          sx={{
            bgcolor: "rgba(245, 158, 11, 0.12)",
            color: "#b45309",
            fontWeight: 600,
            fontSize: 12,
          }}
        />
        <Chip
          label={`${filterCounts.expired} Expired`}
          sx={{
            bgcolor: "rgba(225, 29, 72, 0.1)",
            color: "#be123c",
            fontWeight: 600,
            fontSize: 12,
          }}
        />
        <Box sx={{ flex: 1 }} />
        <TextField
          size="small"
          placeholder="Search SDS..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: "text.secondary" }} />
              </InputAdornment>
            ),
          }}
          sx={{ width: 200 }}
        />
        <Select size="small" defaultValue="all" sx={{ minWidth: 80 }}>
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="current">Current</MenuItem>
          <MenuItem value="expiring_soon">Expiring</MenuItem>
          <MenuItem value="expired">Expired</MenuItem>
        </Select>
      </Stack>

      {/* Warning banner */}
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
          <Stack direction="row" spacing={1} alignItems="center">
            <WarningIcon sx={{ fontSize: 18, color: "#be123c" }} />
            <Typography sx={{ fontSize: 13, color: "#be123c", fontWeight: 500 }}>
              {expiredCount} SDS expired – associated chemical operations are restricted.
            </Typography>
          </Stack>
          <Typography
            sx={{
              fontSize: 13,
              color: "#be123c",
              fontWeight: 700,
              cursor: "pointer",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Renew All
          </Typography>
        </Box>
      )}

      {/* Table */}
      <Card sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "var(--gpv-gray-100)" }}>
              <TableCell sx={{ fontWeight: 700, fontSize: 11, color: "text.secondary", textTransform: "uppercase" }}>
                SDS ID
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 11, color: "text.secondary", textTransform: "uppercase" }}>
                Chemical Name
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 11, color: "text.secondary", textTransform: "uppercase" }}>
                CAS Number
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 11, color: "text.secondary", textTransform: "uppercase" }}>
                Revision
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 11, color: "text.secondary", textTransform: "uppercase" }}>
                Manufacturer
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 11, color: "text.secondary", textTransform: "uppercase" }}>
                Expiry Date
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 11, color: "text.secondary", textTransform: "uppercase" }}>
                Status
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 11, color: "text.secondary", textTransform: "uppercase" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sdsDocuments.map((sds) => (
              <TableRow key={sds.id} hover>
                <TableCell>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: "var(--gpv-primary-500)" }}>
                    {sds.id}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{sds.productName}</Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: 13, color: "text.secondary" }}>{sds.casNumber}</Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: 13, color: "text.secondary" }}>{sds.revision}</Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: 13, color: "text.secondary" }}>{sds.supplierName}</Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    sx={{
                      fontSize: 13,
                      color: sds.status === "expired" ? "#be123c" : "text.secondary",
                      fontWeight: sds.status === "expired" ? 600 : 400,
                    }}
                  >
                    {sds.expiryDate}
                  </Typography>
                </TableCell>
                <TableCell>
                  <StatusChip status={sds.status} />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <IconButton size="small" sx={{ color: "text.secondary" }}>
                      <ViewIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                    <IconButton size="small" sx={{ color: "text.secondary" }}>
                      <DownloadIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
}