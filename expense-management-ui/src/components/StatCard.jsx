import { Card, CardContent, Typography, Box } from "@mui/material";

function StatCard({ title, value, color = "#2D6A4F" }) {
  return (
    <Card
      sx={{
        width: "100%",
        minHeight: 180,
        borderRadius: "24px",
        background: "linear-gradient(145deg, #FFFFFF, #F8FAFC)",
        boxShadow: "0px 10px 30px rgba(0,0,0,0.08)",
        transition: "all 0.3s ease",
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: "0px 18px 40px rgba(0,0,0,0.12)",
        },
      }}
    >
      <CardContent
        sx={{
          p: 3,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            sx={{
              color: "#64748B",
              fontSize: "15px",
              fontWeight: 600,
            }}
          >
            {title}
          </Typography>

          <Box
            sx={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              backgroundColor: color,
              boxShadow: `0px 0px 16px ${color}`,
            }}
          />
        </Box>

        <Box
          sx={{
            mt: 2,
          }}
        >
          <Typography
            sx={{
              fontSize: "3rem",
              fontWeight: 800,
              color: "#1E293B",
              lineHeight: 1,
            }}
          >
            {value}
          </Typography>
        </Box>

        <Box
          sx={{
            mt: 3,
            height: 8,
            borderRadius: 50,
            backgroundColor: color,
            opacity: 0.85,
          }}
        />
      </CardContent>
    </Card>
  );
}

export default StatCard;