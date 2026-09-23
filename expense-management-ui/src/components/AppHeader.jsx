import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  IconButton,
  Tooltip,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";

function AppHeader({
  title = "Financial Dashboard",
  subtitle = "Track expenses intelligently",
  onMenuClick,
  showMenu = false,
}) {
  const email = localStorage.getItem("email");
  const name = email ? email.split("@")[0] : "User";
  const role = localStorage.getItem("role") || "Employee";
  const logout = () => {
    localStorage.clear();
    window.location = "/";
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: "#FFFFFF",
        borderBottom: "1px solid #E2E8F0",
        color: "#111827",
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: "68px", md: "75px" },
          margin: { xs: "4px", md: "12px" },
          gap: { xs: 1, md: 2 },
        }}
      >
        {showMenu && (
          <IconButton
            aria-label="Open navigation"
            onClick={onMenuClick}
            sx={{ color: "#1B4332" }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Box sx={{ flexGrow: 1 }}>
          <Typography
            sx={{
              fontSize: { xs: "20px", sm: "24px", md: "30px" },
              fontWeight: 700,
              color: "#1B4332",
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              color: "#64748B",
              fontSize: { xs: "11px", sm: "13px", md: "14px" },
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {subtitle}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 0.75, md: 2 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              background: "#F8FAFC",
              border: "1px solid #E2E8F0",
              padding: { xs: "5px 7px", sm: "8px 14px" },
              borderRadius: "18px",
              minWidth: { xs: 0, sm: "180px", md: "220px" },
            }}
          >
            <Avatar
              sx={{
                bgcolor: "#2D6A4F",
                width: 40,
                height: 40,
                mr: { xs: 0.75, sm: 2 },
                fontWeight: 700,
              }}
            >
              {name.charAt(0).toUpperCase()}
            </Avatar>

            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  color: "#1E293B",
                  fontSize: { xs: "10px", sm: "12px" },
                  maxWidth: { xs: "72px", sm: "120px" },
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {name}
              </Typography>

              <Typography
                sx={{
                  color: "#40916C",
                  fontSize: { xs: "10px", sm: "12px" },
                  display: { xs: "none", sm: "block" },
                  fontWeight: 600,
                }}
              >
                {role}
              </Typography>
            </Box>
          </Box>

          <Tooltip title="Logout">
            <IconButton
              onClick={logout}
              sx={{
                background: "#FEF2F2",
                color: "#DC2626",
                "&:hover": {
                  background: "#FEE2E2",
                },
              }}
            >
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default AppHeader;