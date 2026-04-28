import {
  Card,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Box,
  Chip,
  TableContainer,
  Tooltip,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import ChemRegButton from '../../components/ChemRegButton';
import StatusChip from '../../components/StatusChip';
import { TABLE_COLUMNS } from './constants';
import type { SdsListRow } from './types';
import { shortId, tableHeadCellSx } from './utils';

type SdsTableProps = {
  rows: SdsListRow[];
  isLoading: boolean;
  onView: (id: string) => void;
  onOpenFile: (documentId: string, fileId: string, mode: 'preview' | 'download') => void;
  onGenerateMiniSds: (id: string) => void;
  onGenerateChemicalCard: (id: string) => void;
};

export default function SdsTable({
  rows,
  isLoading,
  onView,
  onOpenFile,
  onGenerateMiniSds,
  onGenerateChemicalCard,
}: SdsTableProps) {
  if (isLoading) {
    return (
      <Card sx={{ mt: 2, minHeight: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Stack spacing={1} sx={{ alignItems: 'center', py: 6 }}>
          <CircularProgress size={28} />
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Loading SDS documents…</Typography>
        </Stack>
      </Card>
    );
  }

  if (rows.length === 0) {
    return (
      <Card sx={{ mt: 2, minHeight: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Stack spacing={1} sx={{ alignItems: 'center', py: 6, maxWidth: 420, textAlign: 'center' }}>
          <DescriptionIcon sx={{ fontSize: 34, color: 'text.disabled' }} />
          <Typography sx={{ fontSize: 16, fontWeight: 700 }}>No SDS documents found</Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
            Start from a PDF import if you want faster data entry, or create an SDS manually if you already know the key fields.
          </Typography>
        </Stack>
      </Card>
    );
  }

  return (
    <Card sx={{ overflow: 'hidden', borderRadius: 3, border: '1px solid rgba(15,23,42,0.08)', boxShadow: '0 12px 30px rgba(15, 23, 42, 0.04)' }}>
      <Box sx={{ px: 2.5, py: 1.75, borderBottom: '1px solid rgba(15,23,42,0.08)', background: 'linear-gradient(180deg, rgba(248,250,252,0.95) 0%, rgba(255,255,255,1) 100%)' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' } }}>
          <Box>
            <Typography sx={{ fontSize: 15, fontWeight: 800 }}>SDS library</Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
              Open a record, preview its source PDF, or generate operator-facing output.
            </Typography>
          </Box>
          <Chip size="small" label={`${rows.length} visible`} sx={{ fontWeight: 700 }} />
        </Stack>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'var(--gpv-gray-100)' }}>
              {TABLE_COLUMNS.map((label) => (
                <TableCell key={label} sx={tableHeadCellSx}>
                  {label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((sds) => (
              <TableRow key={sds.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                <TableCell>
                  <Stack spacing={0.5}>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'var(--gpv-primary-500)' }}>
                      {shortId(sds.id)}
                    </Typography>
                    <Chip size="small" variant="outlined" label={sds.currentFile ? 'PDF attached' : 'No PDF yet'} sx={{ width: 'fit-content', fontWeight: 700, bgcolor: sds.currentFile ? 'rgba(22,163,74,0.06)' : 'transparent' }} />
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack spacing={0.5}>
                    <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{sds.productName}</Typography>
                    <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{sds.supplierName || 'Supplier missing'}</Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{sds.casNumber || '—'}</Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{sds.revision || '—'}</Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{sds.supplierName}</Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    sx={{
                      fontSize: 13,
                      color: sds.status === 'expired' ? '#be123c' : 'text.secondary',
                      fontWeight: sds.status === 'expired' ? 600 : 400,
                    }}
                  >
                    {sds.expiryDate || '—'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <StatusChip status={sds.status} />
                </TableCell>
                <TableCell sx={{ minWidth: 300, py: 1.5 }}>
                  <Stack direction={{ xs: 'column', xl: 'row' }} spacing={1} useFlexGap>
                    <ChemRegButton variant="outline" onClick={() => onView(sds.id)}>
                      <ViewIcon sx={{ fontSize: 16, mr: 0.5 }} />
                      Open
                    </ChemRegButton>
                    {sds.currentFile ? (
                      <Tooltip title="Preview source SDS PDF">
                        <Box>
                          <ChemRegButton variant="outline" onClick={() => onOpenFile(sds.id, sds.currentFile!.id, 'preview')}>
                            <PdfIcon sx={{ fontSize: 16, mr: 0.5 }} />
                            Preview PDF
                          </ChemRegButton>
                        </Box>
                      </Tooltip>
                    ) : null}
                    <ChemRegButton variant="outline" onClick={() => onGenerateMiniSds(sds.id)}>
                      <DownloadIcon sx={{ fontSize: 16, mr: 0.5 }} />
                      Mini SDS
                    </ChemRegButton>
                    <ChemRegButton variant="outline" onClick={() => onGenerateChemicalCard(sds.id)}>
                      <PdfIcon sx={{ fontSize: 16, mr: 0.5 }} />
                      GPV Card
                    </ChemRegButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}
