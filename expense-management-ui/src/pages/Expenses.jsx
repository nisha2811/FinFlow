import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Box,
  IconButton,
  Tooltip,
  InputAdornment,
  Button,
  MenuItem,
} from "@mui/material";
import Pagination from "@mui/material/Pagination";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DashboardLayout from "../layouts/DashboardLayout";
import Loader from "../components/Loader";
import api from "../api/api";

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const role = localStorage.getItem("role");
  const navigate = useNavigate();
  useEffect(() => {
    loadExpenses();
  }, [page]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/expenses?page=${page}&limit=10`);
      setExpenses(response.data.data || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async (expenseId) => {
    try {
      await api.delete(`/expenses/${expenseId}`);
      toast.success("Expense deleted successfully");
      loadExpenses();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.detail || "Unable to delete expense");
    }
  };

  const exportExcel = async () => {
    try {
      const response = await api.get("/expenses/export/excel", {
        responseType: "blob",
      });

      const blob = new Blob([response.data]);

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download = "expenses.xlsx";

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);
    } catch (error) {
      toast.error("Failed to export expenses");
    }
  };

  const categories = [...new Set(expenses.map((expense) => expense.category))];

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.title?.toLowerCase().includes(search.toLowerCase()) ||
      expense.category?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = !category || expense.category === category;
    const matchesStatus = !status || expense.status === status;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <Loader />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Expense Management"
      subtitle="Gain complete visibility and control over business spending."
    >
      <Card
        sx={{
          borderRadius: "28px",
          background: "rgba(255,255,255,0.95)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              mb: 4,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <TextField
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{
                flex: 2,
                minWidth: "100px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "16px",
                  background: "#F8FAFC",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon
                      sx={{
                        color: "#2D6A4F",
                      }}
                    />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              sx={{
                minWidth: "200px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "16px",
                  background: "#F8FAFC",
                },
              }}
            >
              <MenuItem value="">All Categories</MenuItem>

              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              sx={{
                minWidth: "110px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "16px",
                  background: "#F8FAFC",
                },
              }}
            >
              <MenuItem value="">All Statuses</MenuItem>

              <MenuItem value="PENDING">Pending</MenuItem>

              <MenuItem value="APPROVED">Approved</MenuItem>

              <MenuItem value="REJECTED">Rejected</MenuItem>
            </TextField>

            <Button
              variant="outlined"
              onClick={() => {
                setSearch("");
                setCategory("");
              }}
              sx={{
                height: "56px",
                borderRadius: "16px",
                borderColor: "#2D6A4F",
                color: "#2D6A4F",
                fontWeight: 600,
                "&:hover": {
                  borderColor: "#1B4332",
                  background: "#D8F3DC",
                },
              }}
            >
              Clear Filters
            </Button>
          </Box>

          {filteredExpenses.length === 0 ? (
            <Box textAlign="center" py={8}>
              <Typography variant="h6" color="#64748B">
                No expenses found
              </Typography>

              <Typography color="#94A3B8">
                Try changing the search criteria.
              </Typography>
            </Box>
          ) : (
            <Table>
              <TableHead
                sx={{
                  background: "linear-gradient(135deg,#1B4332,#2D6A4F)",
                }}
              >
                <TableRow>
                  <TableCell
                    sx={{
                      color: "#fff",
                      fontWeight: 700,
                    }}
                  >
                    Title
                  </TableCell>

                  <TableCell
                    sx={{
                      color: "#fff",
                      fontWeight: 700,
                    }}
                  >
                    Category
                  </TableCell>

                  <TableCell
                    sx={{
                      color: "#fff",
                      fontWeight: 700,
                    }}
                  >
                    Amount
                  </TableCell>

                  <TableCell
                    sx={{
                      color: "#fff",
                      fontWeight: 700,
                    }}
                  >
                    Status
                  </TableCell>

                  <TableCell
                    sx={{
                      color: "#fff",
                      fontWeight: 700,
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredExpenses.map((expense) => (
                  <TableRow
                    key={expense.id}
                    hover
                    sx={{
                      "&:hover": {
                        background: "rgba(82,183,136,0.08)",
                      },
                    }}
                  >
                    <TableCell>{expense.title}</TableCell>

                    <TableCell>{expense.category}</TableCell>

                    <TableCell>
                      <Typography fontWeight={700} color="#1B4332">
                        ₹{expense.amount}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={expense.status}
                        sx={{
                          fontWeight: 700,
                          backgroundColor:
                            expense.status === "APPROVED"
                              ? "#D8F3DC"
                              : expense.status === "REJECTED"
                                ? "#FEE2E2"
                                : "#FEF3C7",
                          color:
                            expense.status === "APPROVED"
                              ? "#166534"
                              : expense.status === "REJECTED"
                                ? "#991B1B"
                                : "#92400E",
                        }}
                      />
                    </TableCell>

                    <TableCell
                      sx={{
                        minWidth: "220px",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        <Tooltip title="View Details">
                          <IconButton
                            sx={{
                              color: "#2D6A4F",
                            }}
                            onClick={() => navigate(`/expense/${expense.id}`)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>

                        {expense.status === "PENDING" ? (
                          <Tooltip title="Edit Expense">
                            <IconButton
                              sx={{
                                color: "#15803D",
                              }}
                              onClick={() =>
                                navigate(`/expense/edit/${expense.id}`)
                              }
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Box width={40} />
                        )}

                        {expense.status === "PENDING" ? (
                          <Tooltip title="Delete Expense">
                            <IconButton
                              sx={{
                                color: "#DC2626",
                              }}
                              onClick={() => deleteExpense(expense.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Box width={40} />
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {filteredExpenses.length > 0 && (
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                mt: 4,
              }}
            >
              <Pagination
                page={page}
                count={Math.ceil(total / 10)}
                onChange={(event, value) => setPage(value)}
                sx={{
                  "& .MuiPaginationItem-root": {
                    color: "#1B4332",
                    fontWeight: 600,
                    borderRadius: "12px",
                  },
                  "& .Mui-selected": {
                    background:
                      "linear-gradient(135deg,#1B4332,#2D6A4F,#52B788)",
                    color: "#fff",
                  },
                }}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

export default Expenses;
