//DONE
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import api from "../api/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const login = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    setEmailError("");

    try {
      setLoading(true);
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const response = await api.post("/auth/login", formData);

      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("role", response.data.role);
      localStorage.setItem("email", response.data.email);
      localStorage.setItem("name", response.data.name);
      setSnackbar({
        open: true,
        message: "Login successful!",
        severity: "success",
      });

      setTimeout(() => {
        window.location = "/dashboard";
      }, 1500);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Invalid email or password",
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

      <Box
        sx={{
          width: {
            xs: "100%",
            md: "600px",
            paddingTop: 55,
            paddingBottom: 15,
          },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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
            <AccountCircleIcon
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
              Sign In
            </Typography>

            <Typography
              align="center"
              sx={{
                color: "#64748B",
                mt: 1,
                mb: 2,
              }}
            >
              Access your workspace
            </Typography>

            <form onSubmit={login}>
              <TextField
                fullWidth
                label="Email Address"
                margin="normal"
                value={email}
                error={!!emailError}
                helperText={emailError}
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

              <TextField
                fullWidth
                margin="normal"
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
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
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
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

              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mt={1}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      sx={{
                        color: "#2D6A4F",
                      }}
                    />
                  }
                  label="Remember Me"
                />

                <Typography
                  component={Link}
                  to="/forgot-password"
                  sx={{
                    color: "#2D6A4F",
                    textDecoration: "none",
                    fontWeight: 600,
                    fontSize: "14px",
                  }}
                >
                  Forgot Password?
                </Typography>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 1,
                  py: 1,
                  borderRadius: "14px",
                  fontWeight: 700,
                  fontSize: "15px",
                  background: "linear-gradient(135deg,#1B4332,#2D6A4F,#52B788)",
                  boxShadow: "0 10px 25px rgba(45,106,79,0.35)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg,#143A32,#245542,#40916C)",
                  },
                }}
              >
                {loading ? (
                  <CircularProgress
                    size={24}
                    sx={{
                      color: "#fff",
                    }}
                  />
                ) : (
                  "LOGIN"
                )}
              </Button>

              <Typography textAlign="center" mt={3}>
                <br></br>
                <center>
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    style={{
                      color: "#2D6A4F",
                      fontWeight: 700,
                      textDecoration: "none",
                    }}
                  >
                    Register
                  </Link>
                </center>
              </Typography>
            </form>
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

export default Login;
