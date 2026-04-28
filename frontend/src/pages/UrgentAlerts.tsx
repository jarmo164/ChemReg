import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import SeverityChip from '../components/SeverityChip';
import { useOperationalOverview } from '../hooks/useOperationalOverview';

export default function UrgentAlerts() {
  const { alerts, isLoading, error, reload } = useOperationalOverview();
  const criticalCount = alerts.filter((a) => a.type === 'critical').length;
  const warningCount = alerts.filter((a) => a.type === 'warning').length;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
        <Box>
          <Typography sx={{ fontSize: 24, fontWeight: 900, color: 'text.primary' }}>
            Urgent Alerts
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: 13, color: 'text.secondary' }}>
            Live attention items from SDS expiry and low-stock inventory thresholds.
          </Typography>
        </Box>
        <Button variant="outlined" sx={{ textTransform: 'none', fontWeight: 800 }} onClick={() => void reload()} disabled={isLoading}>
          Refresh
        </Button>
      </Stack>

      {error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : null}

      <Card sx={{ mt: 3 }}>
        <CardContent sx={{ pb: 1.5 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <SeverityChip type="critical" count={criticalCount} />
            <SeverityChip type="warning" count={warningCount} />
          </Stack>
        </CardContent>

        <Divider />

        {isLoading ? (
          <Stack spacing={1} sx={{ alignItems: 'center', py: 6 }}>
            <CircularProgress size={28} />
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Loading alerts…</Typography>
          </Stack>
        ) : alerts.length === 0 ? (
          <Stack spacing={1} sx={{ alignItems: 'center', py: 6 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 700 }}>No urgent alerts</Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
              Current live data does not contain expired SDS or low-stock inventory items.
            </Typography>
          </Stack>
        ) : (
          <Box>
            {alerts.map((a, idx) => (
              <Box key={a.id}>
                <Box sx={{ px: 2.5, py: 2 }}>
                  <Stack direction="row" alignItems="flex-start" spacing={2}>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <SeverityChip type={a.type} />
                        <Typography sx={{ fontSize: 13, fontWeight: 900 }} noWrap>
                          {a.title}
                        </Typography>
                      </Stack>
                      <Typography sx={{ mt: 0.5, fontSize: 12, color: 'text.secondary' }}>
                        {a.description}
                      </Typography>
                    </Box>

                    <Typography sx={{ fontSize: 11, color: 'text.secondary', flexShrink: 0 }}>
                      {a.time}
                    </Typography>
                  </Stack>
                </Box>
                {idx < alerts.length - 1 ? <Divider /> : null}
              </Box>
            ))}
          </Box>
        )}
      </Card>
    </Box>
  );
}
