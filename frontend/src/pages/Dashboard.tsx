import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import StatCard from '../components/cards/StatCard';
import AlertList from '../components/alerts/AlertList';
import { useOperationalOverview } from '../hooks/useOperationalOverview';

export default function Dashboard() {
  const { stats, alerts, isLoading, error, reload } = useOperationalOverview();

  return (
    <>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
        <Box>
          <Typography sx={{ fontSize: 24, fontWeight: 900, color: 'text.primary' }}>
            Safety &amp; Compliance Dashboard
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: 13, color: 'text.secondary' }}>
            Live overview from chemicals, SDS records, and inventory. Risk workflow is still explicitly deferred from the current MVP hardening slice.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            sx={{ textTransform: 'none', fontWeight: 800 }}
            onClick={() => void reload()}
            disabled={isLoading}
          >
            ⟳ Sync Data
          </Button>
        </Stack>
      </Stack>

      {error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : null}

      <Box
        sx={{
          mt: 2,
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
        }}
      >
        {stats.map((stat) => (
          <StatCard key={stat.id} data={stat} />
        ))}
      </Box>

      {isLoading ? (
        <Stack sx={{ mt: 3, py: 6, alignItems: 'center' }} spacing={1}>
          <CircularProgress size={28} />
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Loading operational overview…</Typography>
        </Stack>
      ) : (
        <AlertList alerts={alerts.slice(0, 5)} />
      )}
    </>
  );
}
