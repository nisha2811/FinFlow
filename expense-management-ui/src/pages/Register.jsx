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
import MenuItem from "@mui/material/MenuItem";
import api from "../api/api";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const registerUser = async (e) => {
    e.preventDefault();
    const validationErrors = {};

    if (!form.name.trim()) {
      validationErrors.name = "Name is required";
    }
    if (!form.email.trim()) {
      validationErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      validationErrors.email = "Please enter a valid email address";
    }
    if (!form.password.trim()) {
      validationErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      validationErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[A-Z])/.test(form.password)) {
      validationErrors.password = "Password must contain one uppercase letter";
    } else if (!/(?=.*[a-z])/.test(form.password)) {
      validationErrors.password = "Password must contain one lowercase letter";
    } else if (!/(?=.*\d)/.test(form.password)) {
      validationErrors.password = "Password must contain one number";
    } else if (!/[^A-Za-z0-9]/.test(form.password)) {
      validationErrors.password = "Password must contain one special character";
    }
    if (!form.role) {
      validationErrors.role = "Role is required";
    }
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSnackbar({
        open: true,
        message: "Please fill all required fields",
        severity: "error",
      });
      return;
    }

    setErrors({});

    try {
      setLoading(true);
      await api.post("/auth/register", form);
      setSnackbar({
        open: true,
        message: "Registration successful!",
        severity: "success",
      });

      setTimeout(() => {
        window.location = "/";
      }, 1500);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.detail || "Registration failed",
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
            width: "500px",
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
              Create Account
            </Typography>

            <Typography
              align="center"
              sx={{
                color: "#64748B",
                mt: 1,
                mb: 2,
              }}
            >
              Start managing expenses smarter
            </Typography>

            <form onSubmit={registerUser}>
              <TextField
                fullWidth
                label="Name"
                margin="normal"
                value={form.name}
                error={!!errors.name}
                helperText={errors.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
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
                label="Email Address"
                margin="normal"
                value={form.email}
                error={!!errors.email}
                helperText={errors.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
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
                label="Password"
                margin="normal"
                error={!!errors.password}
                helperText={errors.password}
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value,
                  })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon
                        sx={{
                          color: "#2D6A4F",
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

              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  mt: 1,
                  paddingLeft: 3,
                  color: "#64748B",
                  lineHeight: 1.6,
                }}
              >
                Password must contain:
                <br />
                • At least 8 characters
                <br />
                • One uppercase letter (A-Z)
                <br />
                • One lowercase letter (a-z)
                <br />• One number (0-9)
              </Typography>

              <TextField
                select
                fullWidth
                label="Role"
                margin="normal"
                error={!!errors.role}
                helperText={errors.role}
                value={form.role}
                onChange={(e) =>
                  setForm({
                    ...form,
                    role: e.target.value,
                  })
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "14px",
                    background: "#fff",
                  },
                }}
              >
                <MenuItem value="EMPLOYEE">EMPLOYEE</MenuItem>
                <MenuItem value="MANAGER">MANAGER</MenuItem>
              </TextField>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  py: 1.5,
                  borderRadius: "14px",
                  fontWeight: 700,
                  fontSize: "15px",
                  color: "#fff",
                  background: "linear-gradient(135deg,#1B4332,#2D6A4F,#52B788)",
                  boxShadow: "0 10px 25px rgba(45,106,79,0.35)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg,#143A32,#245542,#40916C)",
                  },
                }}
              >
                REGISTER
              </Button>

              <Typography textAlign="center" mt={3}>
                <br></br>
                <center>
                  {" "}
                  Already have an account?{" "}
                  <Link
                    to="/"
                    style={{
                      color: "#2D6A4F",
                      fontWeight: 700,
                      textDecoration: "none",
                    }}
                  >
                    Login
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

export default Register;
