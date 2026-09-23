import AppSidebar from "../components/AppSidebar";
import AppHeader from "../components/AppHeader";
import { useState } from "react";
import { useMediaQuery } from "@mui/material";

function DashboardLayout({
  children,
  title = "Dashboard",
  subtitle = "Track expenses intelligently",
}) {
  const isMobile = useMediaQuery("(max-width:899px)");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div
      style={{
        display: "block",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <AppSidebar
        mobile={isMobile}
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div
        style={{
          marginLeft: isMobile ? 0 : "280px",
          background: "#F5F7FA",
          minHeight: "100vh",
          overflowX: "hidden",
        }}
      >
        <AppHeader
          title={title}
          subtitle={subtitle}
          onMenuClick={() => setMobileMenuOpen(true)}
          showMenu={isMobile}
        />
        <div
          style={{
            padding: isMobile ? "20px 14px 28px" : "32px",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;