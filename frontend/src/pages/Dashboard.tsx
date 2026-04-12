import { Box, Button, Stack, Typography } from "@mui/material";
import StatCard from "../components/cards/StatCard";
import AlertList from "../components/alerts/AlertList";

import { stats, alerts } from "../data/mockData";

export default function Dashboard() {
    return (
        <>
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
                <Box>
                    <Typography sx={{ fontSize: 24, fontWeight: 900, color: "text.primary" }}>
                        Safety &amp; Compliance Dashboard
                    </Typography>
                    <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary" }}>
                      Thursday, 19 March 2026 · Facility: Northgate Industrial Complex
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1}>
                    <Button
                        variant="outlined"
                        sx={{ textTransform: "none", fontWeight: 800 }}
                    >
                        ⟳ Sync Data
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ textTransform: "none", fontWeight: 800 }}
                    >
                        Generate Report
                    </Button>
                </Stack>
            </Stack>

            <Box
                sx={{
                    mt: 2,
                    display: "grid",
                    gap: 2,
                    gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, 1fr)",
                        lg: "repeat(4, 1fr)",
                    },
                }}
            >
                {stats.map((s) => (
                    <StatCard key={s.id} data={s} />
                ))}
            </Box>

            <AlertList alerts={alerts} />

            {/* Lower panels can be migrated to MUI next; keeping them removed for now to avoid mixed styling. */}
        </>
    );
}