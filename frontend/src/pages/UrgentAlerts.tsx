import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { alerts } from "../data/mockData";
import SeverityChip from "../components/SeverityChip";

export default function UrgentAlerts() {
  const criticalCount = alerts.filter((a) => a.type === "critical").length;
  const warningCount = alerts.filter((a) => a.type === "warning").length;

  return (
    <Box>
      <Typography sx={{ fontSize: 24, fontWeight: 900, color: "text.primary" }}>
        Urgent Alerts
      </Typography>
      <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary" }}>
        Items requiring attention based on SDS expiry and overdue assessments.
      </Typography>

      <Card sx={{ mt: 3 }}>
        <CardContent sx={{ pb: 1.5 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <SeverityChip type="critical" count={criticalCount} />
            <SeverityChip type="warning" count={warningCount} />
          </Stack>
        </CardContent>

        <Divider />

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
                    <Typography sx={{ mt: 0.5, fontSize: 12, color: "text.secondary" }}>
                      {a.description}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexShrink: 0 }}>
                    <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                      {a.time}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{ textTransform: "none", fontWeight: 800 }}
                    >
                      {a.type === "critical" ? "Renew SDS" : "View SDS"}
                    </Button>
                  </Stack>
                </Stack>
              </Box>
              {idx < alerts.length - 1 ? <Divider /> : null}
            </Box>
          ))}
        </Box>
      </Card>
    </Box>
  );
}