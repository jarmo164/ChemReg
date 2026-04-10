import { Card, CardContent, Typography } from "@mui/material";

export default function ChemicalRegister() {
  return (
    <Card>
      <CardContent>
        <Typography sx={{ fontSize: 20, fontWeight: 900 }}>Chemical Register</Typography>
        <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary" }}>
          Placeholder page (demo). Next: list chemicals, add/edit entries, filters, and import.
        </Typography>
      </CardContent>
    </Card>
  );
}

