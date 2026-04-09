import { StatCard as StatCardType } from "../../types";
import { Box, Card, CardContent, Typography } from "@mui/material";

type Props = {
    data: StatCardType;
};

export default function StatCard({ data }: Props) {
    return (
        <Card>
            <CardContent sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                <Box
                    sx={{
                        height: 34,
                        width: 34,
                        borderRadius: 2,
                        bgcolor: "rgba(15, 118, 110, 0.08)",
                        color: "rgba(15, 118, 110, 1)",
                        display: "grid",
                        placeItems: "center",
                        fontWeight: 800,
                        fontSize: 12,
                        flexShrink: 0,
                    }}
                >
                    {/* placeholder icon tile */}
                    ⧉
                </Box>
                <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: 22, fontWeight: 800, color: "text.primary" }}>
                        {data.value}
                    </Typography>
                    <Typography sx={{ mt: 0.25, fontSize: 12, color: "text.secondary" }}>
                        {data.label}
                    </Typography>
                    {data.change ? (
                        <Typography sx={{ mt: 1, fontSize: 11, color: "text.secondary" }}>
                            {data.change}
                        </Typography>
                    ) : null}
                </Box>
            </CardContent>
        </Card>
    );
}