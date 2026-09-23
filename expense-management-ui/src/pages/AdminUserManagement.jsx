import { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import Pagination from "@mui/material/Pagination";

import SearchIcon from "@mui/icons-material/Search";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";

import DashboardLayout from "../layouts/DashboardLayout";
import Loader from "../components/Loader";
import api from "../api/api";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "EMPLOYEE",
};

const ROWS_PER_PAGE = 10;

function AdminUserManagement() {
  const [users, setUsers] = useState([]);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [page, setPage] = useState(1);

  const [form, setForm] = useState(emptyForm);

  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState({
    open: false,
    text: "",
    severity: "success",
  });

  /**
   * Load all users
   */
  const loadUsers = async () => {
    try {
      setLoading(true);

      const response = await api.get("/auth/users");

      setUsers(response.data || []);
    } catch (error) {
      setMessage({
        open: true,
        text:
          error?.response?.data?.detail ||
          "Unable to load users",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  /**
   * Filter users
   */
  const filteredUsers = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !searchValue ||
        `${user.name || ""} ${user.email || ""} ${user.role || ""}`
          .toLowerCase()
          .includes(searchValue);

      const matchesRole =
        roleFilter === "ALL" ||
        user.role === roleFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && user.is_active) ||
        (statusFilter === "INACTIVE" && !user.is_active);

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });
  }, [users, search, roleFilter, statusFilter]);

  /**
   * Pagination
   */
  const pageCount = Math.ceil(
    filteredUsers.length / ROWS_PER_PAGE
  );

  const paginatedUsers = filteredUsers.slice(
    (page - 1) * ROWS_PER_PAGE,
    page * ROWS_PER_PAGE
  );

  /**
   * Reset page when filters change
   */
  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, statusFilter]);

  /**
   * Create user
   */
  const createUser = async () => {
    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.password.trim()
    ) {
      setMessage({
        open: true,
        text: "Please fill in all required fields.",
        severity: "warning",
      });

      return;
    }

    try {
      setSaving(true);

      await api.post("/auth/users", {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
      });

      setOpen(false);

      setForm(emptyForm);

      setMessage({
        open: true,
        text: `${form.role} account created successfully.`,
        severity: "success",
      });

      await loadUsers();
    } catch (error) {
      setMessage({
        open: true,
        text:
          error?.response?.data?.detail ||
          "Unable to create user",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  /**
   * Activate / deactivate user
   */
  const changeStatus = async (user) => {
    if (user.role === "ADMIN") {
      setMessage({
        open: true,
        text: "The administrator account cannot be deactivated.",
        severity: "warning",
      });

      return;
    }

    try {
      await api.patch(
        `/auth/users/${user.id}/status?is_active=${!user.is_active}`
      );

      await loadUsers();

      setMessage({
        open: true,
        text: `${user.name} is now ${
          !user.is_active ? "active" : "inactive"
        }.`,
        severity: "success",
      });
    } catch (error) {
      setMessage({
        open: true,
        text:
          error?.response?.data?.detail ||
          "Unable to update user",
        severity: "error",
      });
    }
  };

  /**
   * Clear filters
   */
  const clearFilters = () => {
    setSearch("");
    setRoleFilter("ALL");
    setStatusFilter("ALL");
    setPage(1);
  };

  /**
   * Role chip styling
   */
  const getRoleStyles = (role) => {
    switch (role) {
      case "ADMIN":
        return {
          backgroundColor: "#D8F3DC",
          color: "#1B4332",
        };

      case "MANAGER":
        return {
          backgroundColor: "#E0F2FE",
          color: "#075985",
        };

      case "EMPLOYEE":
        return {
          backgroundColor: "#F1F5F9",
          color: "#475569",
        };

      default:
        return {
          backgroundColor: "#F1F5F9",
          color: "#475569",
        };
    }
  };

  /**
   * Status chip styling
   */
  const getStatusStyles = (isActive) => {
    if (isActive) {
      return {
        backgroundColor: "#D8F3DC",
        color: "#166534",
      };
    }

    return {
      backgroundColor: "#FEE2E2",
      color: "#991B1B",
    };
  };

  if (loading) {
    return (
      <DashboardLayout title="User Management">
        <Loader />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="User Management"
      subtitle="Create and manage managers and employees."
    >
      <Card
        sx={{
          borderRadius: "28px",
          background: "rgba(255,255,255,0.95)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
        }}
      >
        <CardContent sx={{ p: 4 }}>

          {/* =========================
              FILTER / ACTION BAR
          ========================== */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              mb: 4,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {/* Search */}
            <TextField
              fullWidth
              placeholder="Search name, email or role..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
              }}
              sx={{
                flex: 2,
                minWidth: "250px",

                "& .MuiOutlinedInput-root": {
                  borderRadius: "16px",
                  background: "#F8FAFC",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon
                      sx={{ color: "#2D6A4F" }}
                    />
                  </InputAdornment>
                ),
              }}
            />

            {/* Role filter */}
            <FormControl
              sx={{
                minWidth: 170,
              }}
            >
              <InputLabel id="role-filter-label">
                Role
              </InputLabel>

              <Select
                labelId="role-filter-label"
                value={roleFilter}
                label="Role"
                onChange={(event) =>
                  setRoleFilter(event.target.value)
                }
                sx={{
                  borderRadius: "16px",
                  background: "#F8FAFC",
                }}
              >
                <MenuItem value="ALL">
                  All Roles
                </MenuItem>

                <MenuItem value="ADMIN">
                  Admin
                </MenuItem>

                <MenuItem value="MANAGER">
                  Manager
                </MenuItem>

                <MenuItem value="EMPLOYEE">
                  Employee
                </MenuItem>
              </Select>
            </FormControl>

            {/* Status filter */}
            <FormControl
              sx={{
                minWidth: 170,
              }}
            >
              <InputLabel id="status-filter-label">
                Status
              </InputLabel>

              <Select
                labelId="status-filter-label"
                value={statusFilter}
                label="Status"
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                sx={{
                  borderRadius: "16px",
                  background: "#F8FAFC",
                }}
              >
                <MenuItem value="ALL">
                  All Status
                </MenuItem>

                <MenuItem value="ACTIVE">
                  Active
                </MenuItem>

                <MenuItem value="INACTIVE">
                  Inactive
                </MenuItem>
              </Select>
            </FormControl>

            {/* Clear */}
            <Button
              variant="outlined"
              onClick={clearFilters}
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

            
          </Box>

          
          {/* =========================
              USER TABLE
          ========================== */}
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
            <Table sx={{ minWidth: 950 }}>
              <TableHead
                sx={{
                  background:
                    "linear-gradient(135deg,#1B4332,#2D6A4F)",
                }}
              >
                <TableRow>
                  {[
                    "Name",
                    "Email",
                    "Role",
                    "Status",
                    "Action",
                  ].map((heading) => (
                    <TableCell
                      key={heading}
                      sx={{
                        color: "#fff",
                        fontWeight: 700,
                      }}
                    >
                      {heading}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    hover
                    sx={{
                      "&:hover": {
                        background:
                          "rgba(82,183,136,0.08)",
                      },
                    }}
                  >
                    {/* Name */}
                    <TableCell>
                      <Typography fontWeight={700}>
                        {user.name}
                      </Typography>
                    </TableCell>

                    {/* Email */}
                    <TableCell>
                      {user.email}
                    </TableCell>

                    {/* Role */}
                    <TableCell>
                      <Chip
                        label={user.role}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          ...getRoleStyles(user.role),
                        }}
                      />
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Chip
                        label={
                          user.is_active
                            ? "Active"
                            : "Inactive"
                        }
                        size="small"
                        sx={{
                          fontWeight: 700,
                          ...getStatusStyles(
                            user.is_active
                          ),
                        }}
                      />
                    </TableCell>

                    {/* Action */}
                    <TableCell>
                      {user.role === "ADMIN" ? (
                        <Chip
                          label="Protected"
                          size="small"
                          sx={{
                            fontWeight: 700,
                            background: "#D8F3DC",
                            color: "#1B4332",
                          }}
                        />
                      ) : (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() =>
                            changeStatus(user)
                          }
                          sx={{
                            borderRadius: "10px",
                            borderColor: "#2D6A4F",
                            color: "#2D6A4F",
                            fontWeight: 600,

                            "&:hover": {
                              background: "#D8F3DC",
                              borderColor: "#1B4332",
                            },
                          }}
                        >
                          {user.is_active
                            ? "Deactivate"
                            : "Activate"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}

                {/* Empty state */}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      sx={{ py: 4 }}
                    >
                      <Alert severity="info">
                        No users match your current
                        filters.
                      </Alert>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>

          {/* =========================
              PAGINATION
          ========================== */}
          {filteredUsers.length > 0 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 4,
              }}
            >
              <Pagination
                page={page}
                count={pageCount}
                onChange={(event, value) =>
                  setPage(value)
                }
                color="standard"
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

                    "&:hover": {
                      background:
                        "linear-gradient(135deg,#1B4332,#2D6A4F,#52B788)",
                    },
                  },
                }}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* =========================
          CREATE USER DIALOG
      ========================== */}
      <Dialog
        open={open}
        onClose={() => {
          if (!saving) {
            setOpen(false);
          }
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            color: "#1B4332",
          }}
        >
          Create User
        </DialogTitle>

        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
              mt: 1,
            }}
          >
            {/* Name */}
            <TextField
              fullWidth
              label="Full Name"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              disabled={saving}
            />

            {/* Email */}
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              disabled={saving}
            />

            {/* Password */}
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              disabled={saving}
            />

            {/* Role */}
            <FormControl fullWidth>
              <InputLabel id="create-role-label">
                Role
              </InputLabel>

              <Select
                labelId="create-role-label"
                value={form.role}
                label="Role"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    role: event.target.value,
                  }))
                }
                disabled={saving}
              >
                <MenuItem value="EMPLOYEE">
                  Employee
                </MenuItem>

                <MenuItem value="MANAGER">
                  Manager
                </MenuItem>
              </Select>
            </FormControl>

            <Alert
              severity="info"
              sx={{ borderRadius: "12px" }}
            >
              Only Manager and Employee accounts can be
              created here. The FinFlow administrator is
              created separately as the single system
              administrator.
            </Alert>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 3,
          }}
        >
          <Button
            onClick={() => setOpen(false)}
            disabled={saving}
            sx={{
              borderRadius: "10px",
              color: "#2D6A4F",
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={createUser}
            disabled={
              saving ||
              !form.name.trim() ||
              !form.email.trim() ||
              !form.password.trim()
            }
            sx={{
              borderRadius: "10px",
              background:
                "linear-gradient(135deg,#1B4332,#2D6A4F,#52B788)",
              fontWeight: 600,

              "&:hover": {
                background:
                  "linear-gradient(135deg,#143D2D,#245B43,#409C70)",
              },
            }}
          >
            {saving ? "Creating..." : "Create User"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* =========================
          SNACKBAR
      ========================== */}
      <Snackbar
        open={message.open}
        autoHideDuration={3000}
        onClose={() =>
          setMessage((current) => ({
            ...current,
            open: false,
          }))
        }
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Alert
          severity={message.severity}
          variant="filled"
        >
          {message.text}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}

export default AdminUserManagement;