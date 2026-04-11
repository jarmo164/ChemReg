import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { alerts } from "../data/mockData";

function severityChip(type: "critical" | "warning") {
  if (type === "critical") return { label: "CRITICAL", color: "error" as const };
  return { label: "WARNING", color: "warning" as const };
}

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
            <Chip
              size="small"
              color="error"
              variant="outlined"
              label={`${criticalCount} CRITICAL`}
              sx={{ fontWeight: 800 }}
            />
            <Chip
              size="small"
              color="warning"
              variant="outlined"
              label={`${warningCount} WARNING`}
              sx={{ fontWeight: 800 }}
            />
          </Stack>
        </CardContent>

        <Divider />

        <Box>
          {alerts.map((a, idx) => {
            const sev = severityChip(a.type);
            return (
              <Box key={a.id}>
                <Box sx={{ px: 2.5, py: 2 }}>
                  <Stack direction="row" alignItems="flex-start" spacing={2}>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          size="small"
                          color={sev.color}
                          variant="outlined"
                          label={sev.label}
                          sx={{ fontWeight: 900, letterSpacing: "0.06em" }}
                        />
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
            );
          })}
        </Box>
      </Card>
    </Box>
  );
}

