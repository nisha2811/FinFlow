import { useState, useEffect } from "react";

import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Chip,
  Box,
  TextField,
  MenuItem,
  InputAdornment,
  IconButton,
  Tooltip,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../api/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Pagination from "@mui/material/Pagination";

function ManagerExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const navigate = useNavigate();
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadExpenses();
  }, [page]);

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
      toast.error("Export failed");
    }
  };
  const loadExpenses = async () => {
    try {
      // const response = await api.get("/expenses");
      // setExpenses(response.data.data || []);
      const response = await api.get(`/expenses?page=${page}&limit=10`);

      setExpenses(response.data.data || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load expenses");
    }
  };

  const approve = async (id) => {
    try {
      await api.post(`/approvals/${id}/approve`);
      toast.success("Expense Approved");
      loadExpenses();
    } catch (error) {
      toast.error("Unable to approve expense");
    }
  };

  const reject = async (id) => {
    try {
      await api.post(`/approvals/${id}/reject`);

      toast.success("Expense Rejected");

      loadExpenses();
    } catch (error) {
      toast.error("Unable to reject expense");
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case "APPROVED":
        return {
          backgroundColor: "#D8F3DC",
          color: "#166534",
        };

      case "REJECTED":
        return {
          backgroundColor: "#FEE2E2",
          color: "#991B1B",
        };

      default:
        return {
          backgroundColor: "#FEF3C7",
          color: "#92400E",
        };
    }
  };

  const categories = [...new Set(expenses.map((expense) => expense.category))];

  const filteredExpenses = expenses.filter((expense) => {
    const searchText = search.toLowerCase();
    const matchesSearch =
      expense.title?.toLowerCase().includes(searchText) ||
      expense.employee_name?.toLowerCase().includes(searchText) ||
      expense.employee_email?.toLowerCase().includes(searchText);

    const matchesCategory = !category || expense.category === category;

    // return (matchesSearch && matchesCategory);
    const matchesStatus = !status || expense.status === status;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <DashboardLayout
      title="Approval Registry"
      subtitle="Review, approve and manage employee expense requests."
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
              placeholder="Search..."
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
                minWidth: "150px",
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
                setStatus("");
              }}
              sx={{
                height: "56px",
                borderRadius: "16px",
                borderColor: "#2D6A4F",
                color: "#2D6A4F",
                fontWeight: 600,
                "&:hover": {
                  background: "#D8F3DC",
                  borderColor: "#1B4332",
                },
              }}
            >
              Clear Filters
            </Button>

            <Button
              variant="contained"
              onClick={exportExcel}
              sx={{
                height: "56px",
                borderRadius: "16px",
                background: "linear-gradient(135deg,#1B4332,#2D6A4F,#52B788)",
                fontWeight: 600,

                "&:hover": {
                  background: "linear-gradient(135deg,#143A32,#245542,#40916C)",
                },
              }}
            >
              Export Excel
            </Button>
          </Box>

          {filteredExpenses.length === 0 ? (
            <Box py={8} textAlign="center">
              <Typography variant="h6" color="#64748B">
                No expense requests
              </Typography>

              <Typography color="#94A3B8">
                Incoming approval requests will appear here.
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                width: "100%",
                overflowX: "auto",
                "&::-webkit-scrollbar": {
                  height: "8px",
                },

                "&::-webkit-scrollbar-thumb": {
                  background: "#52B788",
                  borderRadius: "10px",
                },

                "&::-webkit-scrollbar-track": {
                  background: "#E9F5EC",
                },
              }}
            >
              <Table
                sx={{
                  minWidth: 1200,
                }}
              >
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
                      Employee
                    </TableCell>

                    <TableCell
                      sx={{
                        color: "#fff",
                        fontWeight: 700,
                      }}
                    >
                      Email
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
                      View
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        color: "#fff",
                        fontWeight: 700,
                        minWidth: "260px",
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

                      <TableCell>{expense.employee_name}</TableCell>

                      <TableCell>{expense.employee_email}</TableCell>

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
                            ...getStatusStyles(expense.status),
                          }}
                        />
                      </TableCell>

                      <TableCell align="center">
                        <Tooltip title="View Expense">
                          <IconButton
                            sx={{
                              color: "#2D6A4F",
                            }}
                            onClick={() => navigate(`/expense/${expense.id}`)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>

                      <TableCell align="center">
                        {expense.status === "PENDING" ? (
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              justifyContent: "center",
                            }}
                          >
                            <Button
                              variant="contained"
                              size="small"
                              sx={{
                                background: "#2D6A4F",
                                borderRadius: "12px",
                                textTransform: "none",
                                "&:hover": {
                                  background: "#1B4332",
                                },
                              }}
                              onClick={() => approve(expense.id)}
                            >
                              Approve
                            </Button>

                            <Button
                              variant="outlined"
                              size="small"
                              sx={{
                                borderRadius: "12px",
                                color: "#DC2626",
                                borderColor: "#DC2626",
                                textTransform: "none",
                                "&:hover": {
                                  background: "#FEF2F2",
                                  borderColor: "#B91C1C",
                                },
                              }}
                              onClick={() => reject(expense.id)}
                            >
                              Reject
                            </Button>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Completed
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
          {expenses.length > 0 && (
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
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

export default ManagerExpenses;
