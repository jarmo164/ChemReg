import { Card, CardContent, Typography } from '@mui/material';

export default function Settings() {
  return (
    <Card>
      <CardContent>
        <Typography sx={{ fontSize: 20, fontWeight: 900 }}>Settings</Typography>
        <Typography sx={{ mt: 0.5, fontSize: 13, color: 'text.secondary' }}>
          Facility settings, notifications, and advanced preferences are outside the current MVP hardening scope and will land in a later slice.
        </Typography>
      </CardContent>
    </Card>
  );
}
