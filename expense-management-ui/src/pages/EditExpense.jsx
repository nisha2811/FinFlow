import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  ArrowBack,
} from "@mui/icons-material";
import {
  useParams,
  useNavigate,
} from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../api/api";

function EditExpense()
{
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
      title: "",
      amount: "",
      category: "",
      description: "",
    });

  const [snackbar, setSnackbar] = useState({
      open: false,
      message: "",
      severity: "success",
    });

  useEffect(() => {
    loadExpense();
  }, []);

  const loadExpense = async () => {
    try 
    {
      const response = await api.get(`/expenses/${id}`);
      setForm({
        title: response.data.title || "",
        amount: response.data.amount || "",
        category: response.data.category || "",
        description: response.data.description || "",
      });
    } 
    catch (error) 
    {
      console.error(error);
      setSnackbar({
        open: true,
        message: "Unable to load expense",
        severity: "error",
      });
    } 
    finally 
    {
      setLoading(false);
    }
  };

  const updateExpense = async () => {
    try 
    {
      setSaving(true);
      await api.put(`/expenses/${id}`, form);
      setSnackbar({
        open: true,
        message: "Expense updated successfully",
        severity: "success",
      });

      setTimeout(() => {
        navigate("/expenses");
      }, 1500);
    } 
    catch (error) 
    {
      console.error(error);
      setSnackbar({
        open: true,
        message: error?.response?.data ?.detail || "Update failed",
        severity: "error",
      });
    } 
    finally 
    {
      setSaving(false);
    }
  };

  if (loading) 
  {
    return (
      <DashboardLayout>
        <Box
          display="flex"
          justifyContent="center"
          mt={10}
        >
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Edit Expense" subtitle="Modify expense details before approval">
      <Button
        variant="text"
        size="small"
        startIcon={<ArrowBack />}
        onClick={() =>
          navigate("/expenses")
        }
        sx={{
          mb: 2,
          color: "#2D6A4F",
          fontSize: "13px",
          fontWeight: 600,
          textTransform: "none",
          p: 0,
        }}
      >
        Back To Expenses
      </Button>

      <Card
        sx={{
          borderRadius: "28px",
          background: "rgba(255,255,255,0.95)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <TextField
            fullWidth
            label="Expense Title"
            value={form.title}
            margin="normal"
            onChange={(e) =>
              setForm({
                ...form,
                title:
                  e.target.value,
              })
            }
            sx={{
              "& .MuiOutlinedInput-root":
                {
                  borderRadius:
                    "16px",
                },
            }}
          />

          <TextField
            fullWidth
            type="number"
            label="Amount"
            value={form.amount}
            margin="normal"
            onChange={(e) =>
              setForm({
                ...form,
                amount:
                  e.target.value,
              })
            }
            sx={{
              "& .MuiOutlinedInput-root":
                {
                  borderRadius:
                    "16px",
                },
            }}
          />

          <TextField
            select
            fullWidth
            label="Category"
            value={form.category}
            margin="normal"
            onChange={(e) =>
              setForm({
                ...form,
                category:
                  e.target.value,
              })
            }
            sx={{
              "& .MuiOutlinedInput-root":
                {
                  borderRadius:
                    "16px",
                },
            }}
          >
            <MenuItem value="Food">
              Food
            </MenuItem>

            <MenuItem value="Travel">
              Travel
            </MenuItem>

            <MenuItem value="Accommodation">
              Accommodation
            </MenuItem>

            <MenuItem value="Medical">
              Medical
            </MenuItem>

            <MenuItem value="Other">
              Other
            </MenuItem>
          </TextField>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Description"
            value={form.description}
            margin="normal"
            onChange={(e) =>
              setForm({
                ...form,
                description:
                  e.target.value,
              })
            }
            sx={{
              "& .MuiOutlinedInput-root":
                {
                  borderRadius:
                    "16px",
                },
            }}
          />

          <Box mt={4}>
            <Button
              variant="contained"
              onClick={
                updateExpense
              }
              disabled={saving}
              sx={{
                px: 5,
                py: 1.2,
                borderRadius: "14px",
                fontWeight: 700,
                background:
                  "linear-gradient(135deg,#1B4332,#2D6A4F,#52B788)",
                boxShadow:
                  "0 10px 25px rgba(45,106,79,0.35)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg,#143A32,#245542,#40916C)",
                },
              }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() =>
          setSnackbar({
            ...snackbar,
            open: false,
          })
        }
      >
        <Alert
          severity={
            snackbar.severity
          }
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}

export default EditExpense;