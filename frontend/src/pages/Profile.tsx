import { useMemo, useState } from "react";
import { Alert, Box, Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import { getAuthUser, setAuthUser, type AuthUser } from "../auth/auth";

export default function Profile() {
  const initialUser = useMemo(() => getAuthUser(), []);
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [name, setName] = useState(initialUser?.name ?? "");
  const [email, setEmail] = useState(initialUser?.email ?? "");
  const [saved, setSaved] = useState(false);

  if (!user) {
    return (
      <Alert severity="warning">
        No profile found for this session. Please log out and sign in again.
      </Alert>
    );
  }

  const handleSave = () => {
    const next: AuthUser = {
      ...user,
      name: name.trim() || undefined,
      email: email.trim().toLowerCase(),
    };
    setAuthUser(next);
    setUser(next);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Box>
      <Typography sx={{ fontSize: 24, fontWeight: 900, color: "text.primary" }}>
        Profile
      </Typography>
      <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary" }}>
        Manage your account details for this session.
      </Typography>

      <Card sx={{ mt: 3, maxWidth: 640 }}>
        <CardContent>
          <Stack spacing={2}>
            {saved ? <Alert severity="success">Saved</Alert> : null}

            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />
            <TextField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
            />

            <Box>
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>User ID</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{user.id}</Typography>
            </Box>

            <Box>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                sx={{ textTransform: "none", fontWeight: 800 }}
              >
                Save changes
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

