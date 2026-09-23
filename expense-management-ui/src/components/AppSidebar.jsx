import { Link, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Divider,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import Groups2Icon from "@mui/icons-material/Groups2";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import Drawer from "@mui/material/Drawer";

function AppSidebar({ mobile = false, open = false, onClose }) 
{
  const role = localStorage.getItem("role");
  const location = useLocation();
  const menuItems = [{
      text: role === "ADMIN" ? "Admin Dashboard" : role === "MANAGER" ? "Manager Dashboard" : "My Dashboard",
      icon: <DashboardIcon />,
      path: "/dashboard",
    },
  ];

if (role === "EMPLOYEE") 
{
  menuItems.push(
    {
      text: "Expense Registry",
      icon: <ReceiptLongIcon />,
      path: "/expenses",
    }, 
  );
}

if (role === "ADMIN" || role === "MANAGER") 
{
  menuItems.push({
    text: "Approvals Registry",
    icon: <FactCheckIcon />,
    path: "/approvals",
  });
}

if (role === "ADMIN")
{
  menuItems.push(
    {
      text: "User Management",
      icon: <PeopleAltIcon />,
      path: "/user-management",
    },
    {
      text: "Workforce Mapping",
      icon: <Groups2Icon />,
      path: "/team-assignments",
    },
  );
}

if (role === "MANAGER")
{
  menuItems.push({
    text: " Employees Registry",
    icon: <PeopleAltIcon />,
    path: "/my-employees",
  });
}

menuItems.push({
  text: "Create Expense",
  icon: <AddCircleIcon />,
  path: "/create-expense",
}),

menuItems.push({
  text: "User Profile",
  icon: <AccountCircleIcon />,
  path: "/profile",
});

return (
    <Drawer
      variant={mobile ? "temporary" : "permanent"}
      open={mobile ? open : true}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        "& .MuiDrawer-paper": {
          width: "280px",
          minHeight: "100vh",
          backgroundColor: "#1B4332",
          backgroundImage: "linear-gradient(180deg,#1B4332,#2D6A4F,#40916C)",
          color: "#FFFFFF",
          boxSizing: "border-box",
        },
      }}
      PaperProps={{
        sx: {
          width: "280px",
          minHeight: "100vh",
          backgroundColor: "#1B4332",
          backgroundImage: "linear-gradient(180deg,#1B4332,#2D6A4F,#40916C)",
          color: "#FFFFFF",
          padding: "24px",
          boxSizing: "border-box",
          position: "relative",
          boxShadow: "4px 0 20px rgba(0,0,0,0.15)",
        },
      }}
    >
      <Box mb={4}>
        <Typography
          sx={{
            fontSize: "32px",
            fontWeight: 800,
            color: "#D8F3DC",
            lineHeight: 1,
            paddingLeft: "24px",
            paddingTop: "24px",
          }}
        >
          FinFlow
        </Typography>

        <Typography
          sx={{
            fontSize: "15px",
            color: "#B7E4C7",
            mt: 0.5,
            paddingLeft: "24px",
          }}
        >
          Expense Management Suite
        </Typography>
      </Box>
      
      <br></br>
      
      <Divider
        sx={{
          borderColor:"rgba(255,255,255,0.15)",
          mb: 3,
        }}
      />

      <Box
        display="flex"
        flexDirection="column"
        gap={1}
      >
        {menuItems.map((item) => {
          const active =
            location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={mobile ? onClose : undefined}
              style={{
                textDecoration: "none",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  padding: "12px 16px",
                  borderRadius: "14px",
                  color: "#FFFFFF",
                  background: active ? "rgba(255,255,255,0.18)" : "transparent",
                  transition: "0.3s ease",
                  "&:hover": {
                    background: "rgba(255,255,255,0.12)",
                  },
                }}
              >
                {item.icon}
                <Typography fontWeight={500} sx={{ color: "#FFFFFF" }}>
                  {item.text}
                </Typography>
              </Box>
            </Link>
          );
        })}
      </Box>

      <Box
        sx={{
          position: "absolute",
          bottom: 20,
          left: 0,
          width: "100%",
          textAlign: "center",
        }}
      >
        <Typography
          sx={{
            fontSize: "11px",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          FinFlow v1.0
        </Typography>
      </Box>
    </Drawer>
  );
}

export default AppSidebar;