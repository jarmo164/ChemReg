import {
  Box,
  Button,
  Chip,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
} from "@mui/material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { getAuthUser, logout } from "../../auth/auth";
import { alerts } from "../../data/mockData";

const drawerWidth = 288;

function Icon({ variant }: { variant: "shield" | "home" | "doc" | "flask" | "check" | "settings" | "user" }) {
  // Embedded SVGs (from the provided demo HTML style) to avoid needing icon asset folders.
  const common = { width: 18, height: 18, viewBox: "0 0 24 24" };
  switch (variant) {
    case "home":
      return (
        <svg {...common} xmlns="http://www.w3.org/2000/svg">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill="currentColor" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common} xmlns="http://www.w3.org/2000/svg" fill="currentColor">
          <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
        </svg>
      );
    case "doc":
      return (
        <svg {...common} xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common} xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24" />
        </svg>
      );
    case "user":
      return (
        <svg {...common} xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case "flask":
      return (
        <svg {...common} xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 3v6L4 20a2 2 0 0 0 1.8 3h12.4A2 2 0 0 0 20 20L15 9V3" />
          <path d="M8 9h8" />
        </svg>
      );
    case "check":
      return (
        <svg {...common} xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      );
    default:
      return null;
  }
}

const navItems: Array<{ label: string; path: string; icon: Parameters<typeof Icon>[0]["variant"] }> = [
  { label: "Dashboard", path: "/dashboard", icon: "home" },
  { label: "Profile", path: "/profile", icon: "user" },
  { label: "Chemical Register", path: "/chemicals", icon: "flask" },
  { label: "SDS Management", path: "/sds", icon: "doc" },
  { label: "Risk Assessments", path: "/risk", icon: "shield" },
  { label: "Compliance", path: "/compliance", icon: "check" },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getAuthUser();
  const urgentCount = alerts.length;
  const hasUrgent = urgentCount > 0;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", bgcolor: "background.default" }}>
      <Box
        component="aside"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          color: "#ECFDF5",
          // Make readability predictable: solid dark-green base + subtle vignette.
          background:
            "radial-gradient(1000px 500px at 20% -10%, rgba(255,255,255,0.10), transparent 60%), linear-gradient(180deg, #062D22 0%, #041F18 100%)",
          px: 2,
          py: 2,
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 1 }}>
          <Avatar
            sx={{
              height: 36,
              width: 36,
              borderRadius: 2,
              bgcolor: "rgba(255,255,255,0.16)",
              border: "1px solid rgba(255,255,255,0.18)",
              fontWeight: 800,
              fontSize: 13,
            }}
          >
            {(user?.name?.[0] || user?.email?.[0] || "B").toUpperCase()}
          </Avatar>
          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: "white", lineHeight: 1.1 }}>
              ChemReg
            </Typography>
            <Typography sx={{ fontSize: 12, color: "rgba(236, 253, 245, 0.82)" }}>
              {user?.email ?? "Safety & Compliance"}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 2.5, px: 1 }}>
          <Chip
            label={
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    display: "inline-block",
                    width: 8,
                    height: 8,
                    borderRadius: 99,
                    background: hasUrgent ? "rgba(255, 255, 255, 0.95)" : "rgba(236,253,245,0.55)",
                    boxShadow: hasUrgent ? "0 0 0 3px rgba(17,24,39,0.20)" : "none",
                  }}
                />
                <strong>{urgentCount}</strong> urgent alerts
              </span>
            }
            variant="filled"
            sx={{
              width: "100%",
              justifyContent: "flex-start",
              bgcolor: hasUrgent ? "var(--gpv-warning-500)" : "rgba(255,255,255,0.10)",
              color: hasUrgent ? "rgba(255, 251, 235, 0.98)" : "rgba(236,253,245,0.92)",
              fontWeight: 800,
              border: hasUrgent
                ? "1px solid rgba(255,255,255,0.30)"
                : "1px solid rgba(255,255,255,0.18)",
              boxShadow: hasUrgent
                ? "0 10px 20px rgba(245,158,11,0.25), 0 2px 6px rgba(0,0,0,0.20)"
                : "none",
              transform: hasUrgent ? "translateY(-1px)" : "none",
              transition: "transform 120ms ease, box-shadow 120ms ease, background 120ms ease",
              cursor: hasUrgent ? "pointer" : "default",
              "&:hover": hasUrgent
                ? {
                    transform: "translateY(-2px)",
                    boxShadow:
                      "0 14px 26px rgba(245,158,11,0.30), 0 4px 10px rgba(0,0,0,0.22)",
                  }
                : undefined,
              "&:active": hasUrgent ? { transform: "translateY(0px)" } : undefined,
              "&:focus-visible": hasUrgent
                ? { outline: "2px solid rgba(255,255,255,0.85)", outlineOffset: "2px" }
                : undefined,
              "& .MuiChip-label": { width: "100%", textAlign: "left" },
            }}
            onClick={hasUrgent ? () => navigate("/alerts") : undefined}
          />
        </Box>

        <Typography
          sx={{
            mt: 3,
            px: 1,
            fontSize: 12,
            letterSpacing: "0.16em",
            fontWeight: 800,
            color: "rgba(236, 253, 245, 0.70)",
          }}
        >
          MODULES
        </Typography>

        <List dense sx={{ mt: 0.75, px: 0.5 }}>
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <ListItemButton
                key={item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  my: 0.25,
                  px: 1.25,
                  py: 1.1,
                  minHeight: 44,
                  color: active ? "#FFFFFF" : "rgba(236, 253, 245, 0.90)",
                  bgcolor: active ? "rgba(255,255,255,0.18)" : "transparent",
                  borderLeft: active
                    ? "3px solid var(--gpv-accent-500)"
                    : "3px solid transparent",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.12)", color: "#FFFFFF" },
                  "&:focus-visible": {
                    outline: "2px solid rgba(255,255,255,0.75)",
                    outlineOffset: "2px",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 34, color: "inherit", opacity: 1 }}>
                  <Icon variant={item.icon} />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontSize: 14, fontWeight: 800, lineHeight: 1.15 }}
                />
              </ListItemButton>
            );
          })}
        </List>

        <Box sx={{ mt: "auto", px: 0.5, pt: 2 }}>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.12)", mb: 1.5 }} />
          <Button
            fullWidth
            onClick={() => navigate("/settings")}
            sx={{
              justifyContent: "flex-start",
              color: "rgba(236, 253, 245, 0.92)",
              textTransform: "none",
              fontWeight: 800,
              borderRadius: 2,
              px: 1.5,
              py: 1.1,
              minHeight: 44,
              "&:hover": { bgcolor: "rgba(255,255,255,0.12)", color: "#FFFFFF" },
              "&:focus-visible": {
                outline: "2px solid rgba(255,255,255,0.75)",
                outlineOffset: "2px",
              },
            }}
            startIcon={<Icon variant="settings" />}
          >
            Settings
          </Button>
          <Button
            fullWidth
            onClick={handleLogout}
            sx={{
              mt: 0.5,
              justifyContent: "flex-start",
              color: "rgba(236, 253, 245, 0.92)",
              textTransform: "none",
              fontWeight: 800,
              borderRadius: 2,
              px: 1.5,
              py: 1.1,
              minHeight: 44,
              "&:hover": { bgcolor: "rgba(255,255,255,0.12)", color: "#FFFFFF" },
              "&:focus-visible": {
                outline: "2px solid rgba(255,255,255,0.75)",
                outlineOffset: "2px",
              },
            }}
          >
            Logout
          </Button>
        </Box>
      </Box>

      <Box component="main" sx={{ flex: 1, px: 3, py: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
}