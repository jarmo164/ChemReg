import { useMemo, useState } from "react";
import { Alert, Box, Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import { getAuthUser, setAuthUser, type AuthUser } from "../auth/auth";
import { updateUser } from "../api/user";
import { validateName, validateEmail } from "../utils/validators";

export default function Profile() {
  const initialUser = useMemo(() => getAuthUser(), []);
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [name, setName] = useState(initialUser?.name ?? "");
  const [email, setEmail] = useState(initialUser?.email ?? "");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!user) {
    return (
      <Alert severity="warning">
        No profile found for this session. Please log out and sign in again.
      </Alert>
    );
  }

const handleSave = async () => {
  const nextName = name.trim();
  const nextEmail = email.trim().toLowerCase();

  setError("");
  setSaved(false);

  const nameValidationError = validateName(nextName);
  if (nameValidationError) {
    setError(nameValidationError);
    return;
  }

  const emailValidationError = validateEmail(nextEmail);
  if (emailValidationError) {
    setError(emailValidationError);
    return;
  }

  const hasChanges =
    nextName !== user.name ||
    nextEmail !== user.email.toLowerCase();

  if (!hasChanges) {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
    return;
  }

  setSaving(true);

  try {
    const updatedUser = await updateUser(user.id, {
      name: nextName,
      email: nextEmail,
    });

    setAuthUser(updatedUser);
    setUser(updatedUser);
    setName(updatedUser.name);
    setEmail(updatedUser.email);
    setSaved(true);

    window.setTimeout(() => setSaved(false), 2000);
  } catch (error) {
    setError(error instanceof Error ? error.message : "Could not save profile changes.");
  } finally {
    setSaving(false);
  }
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
          disabled={saving}
          error={Boolean(error) && error.toLowerCase().includes("name")}
          helperText={error.toLowerCase().includes("name") ? error : ""}
        />
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          disabled={saving}
          error={Boolean(error) && error.toLowerCase().includes("email")}
          helperText={error.toLowerCase().includes("email") ? error : ""}
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
  disabled={saving}
  sx={{ textTransform: "none", fontWeight: 800 }}
>
  {saving ? "Saving..." : "Save changes"}
</Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

