import { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  Alert,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DashboardLayout from "../layouts/DashboardLayout";
import Loader from "../components/Loader";
import api from "../api/api";
import Pagination from "@mui/material/Pagination";

function TeamAssignments() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [loading, setLoading] = useState(true);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [message, setMessage] = useState({
    open: false,
    text: "",
    severity: "success",
  });

  useEffect(() => {
    api
      .get("/auth/users")
      .then((response) => setUsers(response.data))
      .catch((error) =>
        setMessage({
          open: true,
          text: error?.response?.data?.detail || "Unable to load users",
          severity: "error",
        }),
      )
      .finally(() => setLoading(false));
  }, []);

  const managers = users.filter((user) => user.role === "MANAGER");
  const employees = users.filter((user) => user.role === "EMPLOYEE");
  const filteredEmployees = employees.filter((employee) => {
    const manager = managers.find((user) => user.id === employee.manager_id);
    const text =
      `${employee.name} ${employee.email} ${manager?.name || "Unassigned"}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });
  const paginatedEmployees = filteredEmployees.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage,
  );

  const getAssignmentStyles = (status) => {
    switch (status) {
      case "ASSIGNED":
        return {
          backgroundColor: "#D8F3DC",
          color: "#166534",
        };
      case "UNASSIGNED":
        return {
          backgroundColor: "#FEF3C7",
          color: "#92400E",
        };
      default:
        return {
          backgroundColor: "#F1F5F9",
          color: "#475569",
        };
    }
  };

  const exportExcel = async () => {
    try {
      const response = await api.get("/auth/employees/export", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = "employee-assignments.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setMessage({ open: true, text: "Export failed", severity: "error" });
    }
  };

  const assignEmployee = async (employeeId, managerId) => {
    if (!managerId) return;
    try {
      setAssignmentLoading(true);
      await api.put(`/auth/employees/${employeeId}/manager`, {
        manager_id: managerId,
      });
      setUsers((current) =>
        current.map((user) =>
          user.id === employeeId ? { ...user, manager_id: managerId } : user,
        ),
      );
      setMessage({
        open: true,
        text: "Employee assigned successfully",
        severity: "success",
      });
    } catch (error) {
      setMessage({
        open: true,
        text: error?.response?.data?.detail || "Unable to assign employee",
        severity: "error",
      });
    } finally {
      setAssignmentLoading(false);
    }
  };

  if (loading)
    return (
      <DashboardLayout title="Team Assignments">
        <Loader />
      </DashboardLayout>
    );

  return (
    <DashboardLayout
      title="Workforce Mapping"
      subtitle="View employees, managers and team ownership."
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
              fullWidth
              placeholder="Search employee or manager..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
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
                    <SearchIcon sx={{ color: "#2D6A4F" }} />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="outlined"
              onClick={() => {
                setSearch("");
                setPage(1);
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
              }}
            >
              Export Excel
            </Button>
          </Box>

          {managers.length === 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Create a manager account before assigning employees.
            </Alert>
          )}

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
            <Table sx={{ minWidth: 850 }}>
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
                    Employee
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "#fff",
                      fontWeight: 700,
                    }}
                  >
                    Employee Email
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "#fff",
                      fontWeight: 700,
                    }}
                  >
                    Assigned Manager
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "#fff",
                      fontWeight: 700,
                    }}
                  >
                    Manager Email
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "#fff",
                      fontWeight: 700,
                    }}
                  >
                    Status
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedEmployees.map((employee) => {
                  const manager = managers.find(
                    (user) => user.id === employee.manager_id,
                  );
                  return (
                    <TableRow
                      key={employee.id}
                      hover
                      sx={{
                        "&:hover": {
                          background: "rgba(82,183,136,0.08)",
                        },
                      }}
                    >
                      <TableCell>{employee.name}</TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>
                        <FormControl size="small" sx={{ minWidth: 220 }}>
                          <InputLabel id={`manager-${employee.id}`}>
                            Manager
                          </InputLabel>
                          <Select
                            labelId={`manager-${employee.id}`}
                            value={employee.manager_id || ""}
                            label="Manager"
                            onChange={(event) =>
                              assignEmployee(employee.id, event.target.value)
                            }
                            disabled={
                              assignmentLoading || managers.length === 0
                            }
                          >
                            {managers.map((item) => (
                              <MenuItem key={item.id} value={item.id}>
                                {item.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>{manager?.email || "-"}</TableCell>
                      <TableCell>
                        <Chip
                          label={manager ? "Assigned" : "Unassigned"}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            ...getAssignmentStyles(
                              manager ? "ASSIGNED" : "UNASSIGNED",
                            ),
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredEmployees.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Alert severity="info">
                        No employees match your search.
                      </Alert>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
          {filteredEmployees.length > 0 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                page={page}
                count={Math.ceil(filteredEmployees.length / rowsPerPage)}
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

      <Snackbar
        open={message.open}
        autoHideDuration={3000}
        onClose={() => setMessage((current) => ({ ...current, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert severity={message.severity} variant="filled">
          {message.text}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}

export default TeamAssignments;
