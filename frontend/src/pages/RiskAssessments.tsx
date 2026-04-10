import { Card, CardContent, Typography } from "@mui/material";

export default function RiskAssessments() {
  return (
    <Card>
      <CardContent>
        <Typography sx={{ fontSize: 20, fontWeight: 900 }}>Risk Assessments</Typography>
        <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary" }}>
          Placeholder page (demo). Next: create assessments, assign owners, track status, export.
        </Typography>
      </CardContent>
    </Card>
  );
}

