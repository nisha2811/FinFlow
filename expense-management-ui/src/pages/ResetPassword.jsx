import { useState } from "react";
import { useParams } from "react-router-dom";
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

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LockResetIcon from "@mui/icons-material/LockReset";
import api from "../api/api";

function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const resetPassword = async () => {
    if (!token) {
      setSnackbar({
        open: true,
        message: "Reset link is invalid",
        severity: "error",
      });
      return;
    }
    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/\d/.test(password) ||
      !/[^A-Za-z0-9]/.test(password)
    ) {
      setSnackbar({
        open: true,
        message:
          "Use 8+ characters with uppercase, lowercase, number and special character",
        severity: "error",
      });
      return;
    }
    if (password !== confirmPassword) {
      setSnackbar({
        open: true,
        message: "Passwords do not match",
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/reset-password", {
        token,
        password,
        confirm_password: confirmPassword,
      });

      setSnackbar({
        open: true,
        message: "Password updated successfully",
        severity: "success",
      });

      setTimeout(() => {
        window.location = "/";
      }, 1500);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.detail || "Reset failed",
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
          "linear-gradient(135deg,#081C15 0%,#1B4332 25%,#2D6A4F 50%,#40916C 75%,#52B788 100%)",
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
          Reset Password
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
          Create a new secure password for your FinFlow account and regain
          access instantly.
        </Typography>
      </Box>

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
            <LockResetIcon
              sx={{
                color: "#fff",
                fontSize: 45,
              }}
            />
          </Box>

          <Box mt={5}>
            <Typography
              variant="h4"
              align="center"
              fontWeight="700"
              color="#1B4332"
            >
              Reset Password
            </Typography>

            <Typography
              align="center"
              sx={{
                color: "#64748B",
                mt: 1,
                mb: 3,
              }}
            >
              Enter your new password
            </Typography>

            <TextField
              fullWidth
              type="password"
              label="New Password"
              value={password}
              helperText="Minimum 8 characters with uppercase, lowercase, number and special character"
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon
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

            <TextField
              fullWidth
              type="password"
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{
                mt: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "14px",
                  background: "#fff",
                },
              }}
            />

            <Button
              fullWidth
              variant="contained"
              onClick={resetPassword}
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
              {loading ? "Updating..." : "Reset Password"}
            </Button>
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

export default ResetPassword;
