import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Alert,
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
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import DashboardLayout from "../layouts/DashboardLayout";
import Loader from "../components/Loader";
import api from "../api/api";
import Pagination from "@mui/material/Pagination";

function MyEmployees() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/auth/employees")
      .then((response) => setEmployees(response.data || []))
      .catch((requestError) => {
        setError(
          requestError?.response?.data?.detail || "Unable to load employees",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout
        title="My Team"
        subtitle="View your assigned employee team."
      >
        <Loader />
      </DashboardLayout>
    );
  }

  const filteredEmployees = employees.filter((employee) =>
    `${employee.name} ${employee.email} ${employee.role}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const paginatedEmployees = filteredEmployees.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage,
  );

  const exportExcel = async () => {
    try {
      const response = await api.get("/auth/employees/export", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = "my-employees.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (requestError) {
      setError("Export failed");
    }
  };

  return (
    <DashboardLayout
      title="Employees Registry"
      subtitle="View your assigned employee team."
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
              placeholder="Search employee..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              sx={{
                flex: 2,
                minWidth: "200px",
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

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Table sx={{ minWidth: 120 }}>
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
                  Email ID
                </TableCell>
                <TableCell
                  sx={{
                    color: "#fff",
                    fontWeight: 700,
                  }}
                >
                  Access
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedEmployees.map((employee) => (
                <TableRow
                  key={employee.id}
                  hover
                  sx={{
                    "&:hover": {
                      background: "rgba(82,183,136,0.08)",
                    },
                  }}
                >
                  <TableCell>
                    <Typography fontWeight={700}>{employee.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      ID: {employee.id}
                    </Typography>
                  </TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>
                    <Chip
                      icon={<PeopleAltIcon />}
                      label="Read only"
                      size="small"
                      sx={{
                        background: "#2D6A4F",
                        borderRadius: "12px",
                        color: "white",
                        textTransform: "none",
                        "& .MuiChip-label": {
                          color: "white",
                        },
                        "& .MuiChip-icon": {
                          color: "white",
                        },
                        "&:hover": {
                          background: "#1B4332",
                        },
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {filteredEmployees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Alert severity="info">
                      No assigned employees match your search.
                    </Alert>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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
    </DashboardLayout>
  );
}

export default MyEmployees;
