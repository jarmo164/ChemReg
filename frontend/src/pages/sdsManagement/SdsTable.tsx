import {
  Card,
  CircularProgress,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
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
        <Stack spacing={1} sx={{ alignItems: 'center', py: 6 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700 }}>No SDS documents found</Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
            Add the first SDS document or adjust the current filters.
          </Typography>
        </Stack>
      </Card>
    );
  }

  return (
    <Card sx={{ mt: 2 }}>
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
            <TableRow key={sds.id} hover>
              <TableCell>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'var(--gpv-primary-500)' }}>
                  {shortId(sds.id)}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{sds.productName}</Typography>
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
              <TableCell>
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                  <IconButton size="small" sx={{ color: 'text.secondary' }} onClick={() => onView(sds.id)}>
                    <ViewIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                  {sds.currentFile && (
                    <IconButton
                      size="small"
                      sx={{ color: 'text.secondary' }}
                      onClick={() => onOpenFile(sds.id, sds.currentFile!.id, 'preview')}
                    >
                      <PdfIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  )}
                  <IconButton size="small" sx={{ color: 'text.secondary' }} onClick={() => onGenerateMiniSds(sds.id)} title="Generate mini SDS PDF">
                    <DownloadIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                  <IconButton size="small" sx={{ color: 'text.secondary' }} onClick={() => onGenerateChemicalCard(sds.id)} title="Generate GPV chemical card A4">
                    <PdfIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}