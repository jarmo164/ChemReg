import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "var(--gpv-gray-100)",
      paper: "var(--gpv-white)",
    },
    primary: {
      main: "#126247", // --gpv-primary-500
      dark: "#0e4f3a", // --gpv-primary-600
      light: "#1c7a59", // --gpv-primary-400
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#183a5a", // --gpv-secondary-500
      dark: "#0f2338", // --gpv-secondary-700
      contrastText: "#ffffff",
    },
    success: { main: "#2ea44f" }, // --gpv-success-500
    warning: { main: "#f59e0b" }, // --gpv-warning-500
    error: { main: "#e11d48" }, // --gpv-danger-500
    grey: {
      100: "#f1f5f9", // --gpv-gray-100
      300: "#cbd5e1", // --gpv-gray-300
      500: "#6b7280", // --gpv-gray-500
      700: "#2c3138", // --gpv-gray-700
      900: "#0b0d11", // --gpv-gray-900
    },
  },
  shape: { borderRadius: 8 }, // --radius-md
  typography: {
    fontFamily:
      'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, "Noto Sans", sans-serif',
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid rgba(15, 23, 42, 0.10)",
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.06)", // --shadow-sm
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
        },
      },
    },
  },
});

