import { useState } from "react";
import { toast } from "react-toastify";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  TextField,
  Button,
  Chip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";

import DashboardLayout from "../layouts/DashboardLayout";
import api from "../api/api";

function Profile() {
  const [name, setName] = useState(localStorage.getItem("name") || "");
  const [email, setEmail] = useState(localStorage.getItem("email") || "");
  const [password, setPassword] = useState("");
  const role = localStorage.getItem("role") || "";
  const [editing, setEditing] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const deleteProfile = async () => {
    try {
      await api.delete("/auth/profile");

      localStorage.clear();

      setSnackbar({
        open: true,
        message: "Profile deleted successfully",
        severity: "success",
      });

      setTimeout(() => {
        window.location = "/";
      }, 1500);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.detail || "Failed to delete profile",
        severity: "error",
      });
    }
  };

  const saveProfile = async () => {
    try {
      const response = await api.put("/auth/profile", {
        name,
        password: password || null,
      });

      localStorage.setItem("name", response.data.name);
      localStorage.setItem("email", response.data.email);

      setPassword("");

      setSnackbar({
        open: true,
        message: response.data.message,
        severity: "success",
      });

      setEditing(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.detail || "Failed to update profile",
        severity: "error",
      });
    }
  };

  return (
    <DashboardLayout
      title="My Profile"
      subtitle="Manage account settings and preferences"
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "320px 1fr",
          gap: 3,
        }}
      >
        <Card
          sx={{
            borderRadius: 5,
            boxShadow: "0 10px 30px rgba(0,0,0,.08)",
          }}
        >
          <CardContent>
            <center>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Avatar
                  sx={{
                    marginTop: 4,
                    width: 120,
                    height: 120,
                    fontSize: 42,
                    bgcolor: "#2D6A4F",
                  }}
                >
                  {name?.charAt(0) || "U"}
                </Avatar>
                <br></br>
                <Typography mt={2} variant="h5" fontWeight="700">
                  <b> {name} </b>
                </Typography>

                <Typography color="text.secondary">{email}</Typography>

                <br></br>

                <Chip
                  label={role}
                  sx={{
                    mt: 2,
                    bgcolor: "#D8F3DC",
                    color: "#1B4332",
                  }}
                />
              </Box>
            </center>
          </CardContent>
        </Card>

        <Card
          sx={{
            borderRadius: 5,
            boxShadow: "0 10px 30px rgba(0,0,0,.08)",
          }}
        >
          <CardContent>
            <Typography
              variant="h5"
              fontWeight="700"
              mb={3}
              sx={{
                color: "#1B4332",
              }}
            >
              <b>Profile Information</b>
            </Typography>

            <br></br>

            <TextField
              fullWidth
              label="Full Name"
              value={name}
              disabled={!editing}
              margin="normal"
              onChange={(e) => setName(e.target.value)}
            />

            <TextField
              fullWidth
              label="Email Address"
              value={email}
              disabled
              margin="normal"
              helperText="Email cannot be changed"
              sx={{
                "& .MuiOutlinedInput-root": {
                  background: "#F5F5F5",
                },
              }}
            />

            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={password}
              disabled={!editing}
              margin="normal"
              onChange={(e) => setPassword(e.target.value)}
              helperText="Leave blank to keep current password"
            />

            <Box
              mt={4}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {!editing ? (
                <>
                  <Button
                    variant="contained"
                    onClick={() => setEditing(true)}
                    sx={{
                      px: 5,
                      py: 1.2,
                      borderRadius: "14px",
                      fontWeight: 700,
                      background:
                        "linear-gradient(135deg,#1B4332,#2D6A4F,#52B788)",
                      boxShadow: "0 10px 25px rgba(45,106,79,0.35)",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg,#143A32,#245542,#40916C)",
                      },
                    }}
                  >
                    Edit Profile
                  </Button>

                  <Button
                    variant="contained"
                    onClick={() => setDeleteDialog(true)}
                    sx={{
                      px: 5,
                      py: 1.2,
                      borderRadius: "14px",
                      fontWeight: 700,
                      background:
                        "linear-gradient(135deg,#8B0000,#C1121F,#E63946)",
                      boxShadow: "0 5px 20px rgba(230,57,70,0.35)",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg,#6D0000,#9B0F1A,#D62839)",
                      },
                    }}
                  >
                    Delete Profile
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="contained"
                    onClick={saveProfile}
                    sx={{
                      px: 5,
                      py: 1.2,
                      borderRadius: "14px",
                      fontWeight: 700,
                      background:
                        "linear-gradient(135deg,#1B4332,#2D6A4F,#52B788)",
                      boxShadow: "0 10px 25px rgba(45,106,79,0.35)",
                    }}
                  >
                    Save Changes
                  </Button>

                  <Box>
                    <Button
                      variant="outlined"
                      onClick={() => setEditing(false)}
                      sx={{
                        px: 5,
                        py: 1.2,
                        borderRadius: "14px",
                        borderColor: "#2D6A4F",
                        color: "#2D6A4F",
                        mr: 1,
                      }}
                    >
                      Cancel
                    </Button>

                    <Button
                      variant="contained"
                      onClick={() => setDeleteDialog(true)}
                      sx={{
                        px: 4,
                        py: 1.2,
                        borderRadius: "14px",
                        fontWeight: 700,
                        background:
                          "linear-gradient(135deg,#8B0000,#C1121F,#E63946)",
                        boxShadow: "0 5px 20px rgba(230,57,70,0.35)",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg,#6D0000,#9B0F1A,#D62839)",
                        },
                      }}
                    >
                      Delete Profile
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          </CardContent>
        </Card>
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

      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>
          <b>Delete Profile</b>
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your profile? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => etDeleteDialog(false)}
            sx={{
              px: 5,
              py: 1.2,
              borderRadius: "14px",
              borderColor: "#2D6A4F",
              color: "#2D6A4F",
              mr: 1,
            }}
          >
            No
          </Button>

          <Button
            variant="contained"
            onClick={deleteProfile}
            sx={{
              px: 4,
              py: 1.2,
              borderRadius: "14px",
              fontWeight: 700,
              background: "linear-gradient(135deg,#8B0000,#C1121F,#E63946)",
              boxShadow: "0 5px 20px rgba(23,7,7,0)",
              "&:hover": {
                background: "linear-gradient(135deg,#6D0000,#9B0F1A,#D62839)",
              },
            }}
          >
            Yes, Delete
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default Profile;
