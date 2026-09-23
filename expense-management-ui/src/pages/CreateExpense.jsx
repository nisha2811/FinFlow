import {
  Button,
  TextField,
  Card,
  CardContent,
  MenuItem,
  Typography,
  Box,
  Grid,
  InputAdornment,
} from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import CategoryIcon from "@mui/icons-material/Category";
import DescriptionIcon from "@mui/icons-material/Description";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import {
  useState,
  useEffect,
} from "react";
import { toast } from "react-toastify";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../api/api";

function CreateExpense() 
{
  const role = localStorage.getItem("role");
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "",
    description: "",
    employee_id: "",
  });

  const [receipt, setReceipt] = useState(null);

  const [errors, setErrors] = useState({
    title: "",
    amount: "",
    category: "",
    receipt: "",
    employee_id: "",
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    if (role !== "ADMIN" && role !== "MANAGER") 
    {
      return;
    }
    try 
    {
      const response = await api.get("/auth/employees");
      setEmployees(response.data || []);
    } 
    catch (error) 
    {
      console.error(error);
    }
  };

  const validate = () => {
    let temp = {};
    if (!form.title.trim()) 
    {
      temp.title = "Expense title is required";
    }
    if (!form.amount) 
    {
      temp.amount = "Amount is required";
    } 
    else if (Number(form.amount) <= 0) 
    {
      temp.amount = "Amount must be greater than 0";
    }

    if (!form.category) 
    {
      temp.category = "Category is required";
    }

    if (!receipt) 
    {
      temp.receipt = "Receipt is required";
    }

    if ((role === "ADMIN" || role === "MANAGER") && form.employee_id) 
    {
      temp.employee_id = "Employee is required";
    }

    setErrors(temp);
    return (Object.keys(temp).length === 0);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate())
    {
      return;
    }
    try 
    {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("amount", form.amount);
      formData.append("category", form.category);
      formData.append("description", form.description);
      if (role === "ADMIN" || role === "MANAGER") 
      {
        formData.append("employee_id", form.employee_id);
      }
      formData.append("file", receipt);

      await api.post("/expenses/create-with-receipt",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Expense submitted successfully");

      setForm({
        title: "",
        amount: "",
        category: "",
        description: "",
        employee_id: "",
      });

      setReceipt(null);

      setErrors({
        title: "",
        amount: "",
        category: "",
        receipt: "",
        employee_id: "",
      });
    } 
    catch (error) 
    {
      toast.error("Failed to submit expense");
    }
  };

  return (
    <DashboardLayout title="New Expense Request" subtitle="Submit a new expense request for approval">
      <Card
        elevation={0}
        sx={{
          borderRadius: "24px",
          border: "1px solid #E2E8F0",
          boxShadow: "0px 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={submit}>
            <Grid container spacing={3}>
              {(role === "ADMIN" || role === "MANAGER") && (
                <Grid
                  size={{
                    xs: 12,
                    md: 12,
                  }}
                >
                <TextField
                  select
                  fullWidth
                  required
                  label="Employee"
                  value={form.employee_id}
                  error={!!errors.employee_id}
                  helperText={errors.employee_id}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      employee_id:
                        e.target.value,
                    })
                  }
                  sx={{
                    "& .MuiOutlinedInput-root":
                      {
                        borderRadius:
                          "14px",
                      },
                  }}
                >
                  {employees.map(
                    (employee) => (
                      <MenuItem
                        key={employee.id}
                        value={employee.id}
                      >
                        {employee.name}
                        {" - "}
                        {employee.email}
                      </MenuItem>
                    )
                  )}
                </TextField>
            </Grid>
            )}
            
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                required
                label="Expense Title"
                value={form.title}
                error={!!errors.title}
                helperText={errors.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: e.target.value,
                  })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ReceiptLongIcon
                        sx={{
                          color: "#2D6A4F",
                        }}
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "14px",
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                required
                type="number"
                label="Amount"
                value={form.amount}
                error={!!errors.amount}
                helperText={errors.amount}
                onChange={(e) =>
                  setForm({
                    ...form,
                    amount: e.target.value,
                  })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CurrencyRupeeIcon
                        sx={{
                          color: "#2D6A4F",
                        }}
                      />
                   </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                      borderRadius: "14px",
                    },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                fullWidth
                required
                label="Category"
                value={form.category}
                error={!!errors.category}
                helperText={errors.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category:
                      e.target.value,
                  })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CategoryIcon
                        sx={{
                          color: "#2D6A4F",
                        }}
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "14px",
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

                <MenuItem value="Office">
                  Office
                </MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                multiline
                rows={5}
                fullWidth
                label="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description:
                      e.target.value,
                  })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment
                      position="start"
                      sx={{
                        alignSelf:
                          "flex-start",
                        mt: 1,
                      }}
                    >
                      <DescriptionIcon
                        sx={{
                          color: "#2D6A4F",
                        }}
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root":
                  {
                    borderRadius: "14px",
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography
                sx={{
                  mb: 1,
                  marginLeft : "5px",
                  color: "#1B4332",
                }}
              >
                Upload Receipt *
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <Button
                  component="label"
                  startIcon={<UploadFileIcon />}
                  variant="outlined"
                  sx={{
                    borderRadius: "14px",
                    borderColor: "#2D6A4F",
                    color: "#2D6A4F",
                    px: 3,
                    textTransform: "none",
                  }}
                >
                  Choose file
                  <input
                    hidden
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) =>
                      setReceipt(e.target.files[0])
                    }
                  />
                </Button>

                {receipt && (
                  <Typography
                    sx={{
                      color: "#64748B",
                      fontSize: "14px",
                    }}
                  >
                    {receipt.name}
                  </Typography>
                )}
              </Box>

              {errors.receipt && (
                <Typography
                  sx={{
                    mt: 1,
                    color: "#d32f2f",
                    fontSize: "12px",
                  }}
                >
                  {errors.receipt}
                </Typography>
              )}
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    px: 5,
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
                  Submit Expense
                </Button>
              </Box>
             </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

export default CreateExpense;