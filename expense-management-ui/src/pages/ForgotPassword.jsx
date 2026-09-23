import { useState } from "react";
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Snackbar,
  Alert,
  InputAdornment,
} from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import api from "../api/api";
import { Link } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const sendEmail = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setSnackbar({
        open: true,
        message: "Enter a valid email address",
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });

      setSnackbar({
        open: true,
        message: "Please check your email for the password reset link.",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.detail || "Failed to send reset email",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(135deg, #081C15 0%, #1B4332 25%, #2D6A4F 50%, #40916C 75%, #52B788 100%)",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -120,
          left: -100,
          width: 450,
          height: 450,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
          filter: "blur(80px)",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          bottom: -150,
          right: -100,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "rgba(82,183,136,0.25)",
          filter: "blur(90px)",
        }}
      />

      <Box
        sx={{
          flex: 1,
          display: {
            xs: "none",
            md: "flex",
          },
          flexDirection: "column",
          justifyContent: "center",
          pl: 10,
          color: "white",
          zIndex: 2,
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontWeight: 800,
            lineHeight: 1,
          }}
        >
          FinFlow
        </Typography>

        <Typography
          sx={{
            mt: 2,
            fontSize: "24px",
            color: "#D8F3DC",
            fontWeight: 600,
          }}
        >
          Expense Management Suite
        </Typography>

        <Typography
          sx={{
            mt: 3,
            maxWidth: "500px",
            opacity: 0.9,
            lineHeight: 1.8,
            fontSize: "16px",
          }}
        >
          Streamline expense tracking, approvals, reporting and spending
          insights through a single enterprise platform.
        </Typography>
      </Box>

      {/* Right Side */}

      <Box
        sx={{
          width: {
            xs: "100%",
            md: "600px",
          },
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          px: 3,
          zIndex: 2,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "430px",
            maxWidth: "100%",
            borderRadius: "35px",
            p: 5,
            position: "relative",
            background: "rgba(255,255,255,0.93)",
            backdropFilter: "blur(12px)",
            boxShadow: "0px 25px 70px rgba(0,0,0,0.25)",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: "-45px",
              left: "50%",
              transform: "translateX(-50%)",
              width: 90,
              height: 90,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#1B4332,#52B788)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 25px rgba(0,0,0,0.30)",
            }}
          >
            <MarkEmailReadIcon
              sx={{
                color: "#fff",
                fontSize: 55,
              }}
            />
          </Box>

          <Box mt={5}>
            <Typography
              variant="h4"
              align="center"
              fontWeight="700"
              color="#1B4332"
              sx={{
                paddingTop: 1.5,
              }}
            >
              Forgot Password
            </Typography>

            <Typography
              align="center"
              sx={{
                color: "#64748B",
                mt: 1,
                mb: 3,
              }}
            >
              Enter your registered email address
            </Typography>

            <TextField
              fullWidth
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon
                      sx={{
                        color: "#2D6A4F",
                        fontSize: 24,
                      }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "14px",
                  background: "#fff",
                },
              }}
            />

            <Button
              fullWidth
              variant="contained"
              onClick={sendEmail}
              disabled={loading}
              sx={{
                mt: 3,
                py: 1.2,
                borderRadius: "14px",
                fontWeight: 700,
                background: "linear-gradient(135deg,#1B4332,#2D6A4F,#52B788)",
                boxShadow: "0 10px 25px rgba(45,106,79,0.35)",
                "&:hover": {
                  background: "linear-gradient(135deg,#143A32,#245542,#40916C)",
                },
              }}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>

            <Typography textAlign="center" mt={3}>
              <br></br>
              <center>
                Remember your password?{" "}
                <Link
                  to="/"
                  style={{
                    color: "#2D6A4F",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  Back to Login
                </Link>
              </center>
            </Typography>
          </Box>
        </Paper>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() =>
          setSnackbar({
            ...snackbar,
            open: false,
          })
        }
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          sx={{
            width: "100%",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ForgotPassword;
