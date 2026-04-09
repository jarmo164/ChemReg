import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "var(--gpv-gray-100)",
      paper: "var(--gpv-white)",
    },
    primary: {
      main: "var(--gpv-secondary-500)",
    },
    success: { main: "var(--gpv-success-500)" },
    warning: { main: "var(--gpv-warning-500)" },
    error: { main: "var(--gpv-danger-500)" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily:
      'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid rgba(15, 23, 42, 0.10)",
          boxShadow: "var(--shadow-sm)",
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
    },
  },
});

