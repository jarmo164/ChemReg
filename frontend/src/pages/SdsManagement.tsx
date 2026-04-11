import { Card, CardContent, Typography } from "@mui/material";

export default function SdsManagement() {
  return (
    <Card>
      <CardContent>
        <Typography sx={{ fontSize: 20, fontWeight: 900 }}>SDS Management</Typography>
        <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary" }}>
          Placeholder page (demo). Next: upload SDS, expiry tracking, renewals, and approvals.
        </Typography>
      </CardContent>
    </Card>
  );
}

