import { Card, CardContent, Typography } from '@mui/material';

export default function RiskAssessments() {
  return (
    <Card>
      <CardContent>
        <Typography sx={{ fontSize: 20, fontWeight: 900 }}>Risk Assessments</Typography>
        <Typography sx={{ mt: 0.5, fontSize: 13, color: 'text.secondary' }}>
          This route is not yet in the current MVP delivery slice. Next implementation step: persisted risk assessments, role-based approval states, and exportable reports.
        </Typography>
      </CardContent>
    </Card>
  );
}
