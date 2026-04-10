import { Alert } from "../../types";
import {
    Box,
    Button,
    Card,
    CardHeader,
    Chip,
    Divider,
    Stack,
    Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

type Props = {
    alerts: Alert[];
};

function severityChip(type: Alert["type"]) {
    switch (type) {
        case "critical":
            return { label: "CRITICAL", color: "error" as const, variant: "outlined" as const };
        case "warning":
            return { label: "WARNING", color: "warning" as const, variant: "outlined" as const };
        default: {
            const _exhaustive: never = type;
            return _exhaustive;
        }
    }
}

function actionLabel(type: Alert["type"]) {
    switch (type) {
        case "critical":
            return "Renew SDS";
        case "warning":
            return "View SDS";
        default: {
            const _exhaustive: never = type;
            return _exhaustive;
        }
    }
}

export default function AlertList({ alerts }: Props) {
    const navigate = useNavigate();
    const criticalCount = alerts.filter((a) => a.type === "critical").length;
    const warningCount = alerts.filter((a) => a.type === "warning").length;

    return (
        <Card sx={{ mt: 3 }}>
            <CardHeader
                title={
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary" }}>
                            Urgent Alerts
                        </Typography>
                        <Chip
                            size="small"
                            color="error"
                            variant="outlined"
                            label={`${criticalCount} CRITICAL`}
                            sx={{ fontWeight: 700 }}
                        />
                        <Chip
                            size="small"
                            color="warning"
                            variant="outlined"
                            label={`${warningCount} WARNING`}
                            sx={{ fontWeight: 700 }}
                        />
                    </Stack>
                }
                action={
                    <Button
                        size="small"
                        onClick={() => navigate("/alerts")}
                        sx={{ textTransform: "none", fontWeight: 700 }}
                    >
                        View all →
                    </Button>
                }
                sx={{ pb: 1 }}
            />

            <Divider />

            <Box>
                {alerts.map((alert, idx) => {
                    const chip = severityChip(alert.type);
                    return (
                        <Box key={alert.id}>
                            <Box sx={{ px: 2.5, py: 2 }}>
                                <Stack direction="row" alignItems="flex-start" spacing={2}>
                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <Chip
                                                size="small"
                                                color={chip.color}
                                                variant={chip.variant}
                                                label={chip.label}
                                                sx={{ fontWeight: 800, letterSpacing: "0.05em" }}
                                            />
                                            <Typography
                                                sx={{
                                                    fontSize: 13,
                                                    fontWeight: 800,
                                                    color: "text.primary",
                                                }}
                                                noWrap
                                            >
                                                {alert.title}
                                            </Typography>
                                        </Stack>
                                        <Typography
                                            sx={{ mt: 0.5, fontSize: 12, color: "text.secondary" }}
                                        >
                                            {alert.description}
                                        </Typography>
                                    </Box>

                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        spacing={1.5}
                                        sx={{ flexShrink: 0 }}
                                    >
                                        <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                                            {alert.time}
                                        </Typography>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            sx={{ textTransform: "none", fontWeight: 700 }}
                                        >
                                            {actionLabel(alert.type)}
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
    );
}