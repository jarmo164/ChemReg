import { Card, CardContent, Typography } from "@mui/material";

export default function Compliance() {
  return (
    <Card>
      <CardContent>
        <Typography sx={{ fontSize: 20, fontWeight: 900 }}>Compliance</Typography>
        <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary" }}>
          Placeholder page (demo). Next: compliance checks, reporting, and audit trail.
        </Typography>
      </CardContent>
    </Card>
  );
}

