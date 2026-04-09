import {
  Box,
  Button,
  Chip,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Avatar,
  Typography,
} from "@mui/material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { getAuthUser, logout } from "../../auth/auth";

const drawerWidth = 288;

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Profile", path: "/profile" },
  { label: "Chemical Register", path: "/chemicals" },
  { label: "SDS Management", path: "/sds" },
  { label: "Risk Assessments", path: "/risk" },
  { label: "Compliance", path: "/compliance" },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getAuthUser();

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
          color: "rgba(226, 232, 240, 0.95)",
          background:
            "linear-gradient(180deg, rgba(15,23,42,1) 0%, rgba(15,23,42,1) 65%, rgba(2,6,23,1) 100%)",
          px: 2,
          py: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 1 }}>
          <Avatar
            sx={{
              height: 36,
              width: 36,
              borderRadius: 2,
              bgcolor: "rgba(30, 41, 59, 1)",
              fontWeight: 800,
              fontSize: 13,
            }}
          >
            {(user?.name?.[0] || user?.email?.[0] || "B").toUpperCase()}
          </Avatar>
          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: "white", lineHeight: 1.1 }}>
              ChemGuard
            </Typography>
            <Typography sx={{ fontSize: 12, color: "rgba(148,163,184,1)" }}>
              {user?.email ?? "Safety & Compliance"}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 2.5, px: 1 }}>
          <Chip
            label={
              <span>
                <strong>3</strong> urgent alerts
              </span>
            }
            variant="outlined"
            sx={{
              width: "100%",
              justifyContent: "flex-start",
              bgcolor: "rgba(245,158,11,0.10)",
              borderColor: "rgba(245,158,11,0.20)",
              color: "rgba(254,243,199,1)",
              fontWeight: 600,
              "& .MuiChip-label": { width: "100%", textAlign: "left" },
            }}
          />
        </Box>

        <Typography
          sx={{
            mt: 3,
            px: 1,
            fontSize: 11,
            letterSpacing: "0.16em",
            fontWeight: 800,
            color: "rgba(148,163,184,1)",
          }}
        >
          MODULES
        </Typography>

        <List dense sx={{ mt: 0.5, px: 0.5 }}>
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <ListItemButton
                key={item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  my: 0.25,
                  color: active ? "white" : "rgba(203,213,225,1)",
                  bgcolor: active ? "rgba(30,41,59,0.85)" : "transparent",
                  "&:hover": { bgcolor: "rgba(30,41,59,0.45)", color: "white" },
                }}
              >
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }}
                />
              </ListItemButton>
            );
          })}
        </List>

        <Box sx={{ mt: "auto", px: 0.5, pt: 2 }}>
          <Divider sx={{ borderColor: "rgba(51,65,85,0.7)", mb: 1.5 }} />
          <Button
            fullWidth
            onClick={() => navigate("/settings")}
            sx={{
              justifyContent: "flex-start",
              color: "rgba(203,213,225,1)",
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              px: 1.5,
              "&:hover": { bgcolor: "rgba(30,41,59,0.45)", color: "white" },
            }}
          >
            Settings
          </Button>
          <Button
            fullWidth
            onClick={handleLogout}
            sx={{
              mt: 0.5,
              justifyContent: "flex-start",
              color: "rgba(203,213,225,1)",
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              px: 1.5,
              "&:hover": { bgcolor: "rgba(30,41,59,0.45)", color: "white" },
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