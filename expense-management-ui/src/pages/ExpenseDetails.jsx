import { useEffect, useState } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import {
  Card,
  CardContent,
  Typography,
  Divider,
  Chip,
  Grid,
  Button,
  Box,
  Paper,
} from "@mui/material";

import {
  ArrowBack,
} from "@mui/icons-material";

import {
  useParams,
  useNavigate,
} from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";
import Loader from "../components/Loader";
import api from "../api/api";

function ExpenseDetails() 
{
  const { id } = useParams();
  const navigate = useNavigate();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExpense();
  }, []);

  const viewReceipt = async () => {
    try 
    {
      const response = await api.get(`/expenses/${expense.id}/receipt`,
        {
          responseType: "blob",
        }
      );

      const contentType = response.headers["content-type"];
      const blob = new Blob([response.data],
        {
          type: contentType,
        }
      );

      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } 
    catch (error) 
    {
      console.error(error);
    }
  };

  const downloadReceipt = async () => {
    try 
    {
      const response = await api.get(`/expenses/${expense.id}/receipt`, {
          responseType: "blob",
        }
      );

      const contentType = response.headers["content-type"];
      const blob = new Blob([response.data], {
            type: contentType,
          }
        );

      const url = URL.createObjectURL(blob);
      const fileName = expense.receipt_path ?.split("/").pop() || "receipt";
      const link = document.createElement("a");

      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } 
    catch (error) 
    {
      console.error(error);
    }
  };

  const loadExpense = async () => {
    try {
      const response = await api.get(`/expenses/${id}`);
      setExpense(response.data);
    } 
    catch (error) 
    {
      console.error(error);
    } 
    finally 
    {
      setLoading(false);
    }
  };

  const getStatusStyles = (status) => {
    switch (status) 
    {
      case "APPROVED":
        return {
          background: "#D8F3DC",
          color: "#166534",
        };

      case "REJECTED":
        return {
          background: "#FEE2E2",
          color: "#991B1B",
        };

      default:
        return {
          background: "#FEF3C7",
          color: "#92400E",
        };
    }
  };

  if (loading) 
  {
    return (
      <DashboardLayout>
        <Loader />
      </DashboardLayout>
    );
  }

  if (!expense) 
  {
    return (
      <DashboardLayout>
        <Typography>
          Expense not found
        </Typography>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Expense Management" subtitle="Gain complete visibility and control over business spending.">
      <Button
        variant="text"
        startIcon={<ArrowBack />}
        onClick={() => {
          const role = localStorage.getItem("role");
          if (role === "MANAGER") 
          {
            navigate("/approvals");
          } 
          else if (role === "ADMIN") 
          {
            navigate("/approvals");
          } 
          else 
          {
            navigate("/expenses");
          }
        }}
        sx={{
          mb: 2,
          color: "#2D6A4F",
          fontSize: "15px",
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
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={2}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  color: "#1B4332",
                }}
              >
                {expense.title}
              </Typography>

              <Typography
                color="text.secondary"
                mt={1}
              >
                Expense ID:
                {" "}
                {expense.id}
              </Typography>
            </Box>
            
            <br></br>
            
            <Chip
              label={expense.status}
              sx={{
                fontWeight: 700,
                px: 1.5,
                ...getStatusStyles(
                  expense.status
                ),
              }}
            />
          </Box>

          <Divider sx={{ my: 1 }} />

          <Grid
            container
            spacing={3}
          >
            <Grid
              item
              xs={12}
              md={6}
            >
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 4,
                  background: "#D8F3DC",
                }}
              >
                <Typography
                  color="text.secondary"
                >
                 <b> Expense Amount</b>
                </Typography>

                <Typography
                  variant="h4"
                  fontWeight="700"
                  color="#1B4332"
                >
                  ₹{expense.amount}
                </Typography>
              </Paper>
            </Grid>

            <Grid
              item
              xs={12}
              md={6}
            >
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 4,
                  background: "#F8FAFC",
                }}
              >
                <Typography
                  color="text.secondary"
                >
                  <b>Category</b>
                </Typography>

                <Typography
                  variant="h4"
                  fontWeight="700"
                  color="#1B4332"
                >
                  {expense.category}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Paper
            sx={{
              mt: 4,
              p: 3,
              borderRadius: 4,
              background: "#F8FAFC",
            }}
          >
            <Typography
              variant="h6"
              fontWeight="700"
              color="#1B4332"
              mb={2}
            >
              <b>Description</b>
            </Typography>

            <Typography>
              {expense.description || "No description available"}
            </Typography>
          </Paper>

          <Paper
            sx={{
              mt: 4,
              p: 3,
              borderRadius: 4,
              background: "#F8FAFC",
            }}
          >
            <Typography
              variant="h6"
              fontWeight="700"
              color="#1B4332"
              mb={2}
            >
              <b>Approval Details</b>
            </Typography>

            <Typography>
              <b> Approved By : </b>{" "}
              {expense.approved_by || "Not reviewed yet"}
            </Typography>

            <Typography mt={1}>
            <b> Approved At : </b>{" "}
              {expense.approved_at ? new Date(expense.approved_at).toLocaleString() : "Not reviewed yet"}
            </Typography>
          </Paper>

          <Paper
            sx={{
              mt: 4,
              p: 3,
              borderRadius: 4,
              background: "#F8FAFC",
            }}
          >
            <Typography
              variant="h6"
              fontWeight="700"
              color="#1B4332"
              mb={3}
            >
              <b> Receipt</b>
            </Typography>

            {expense.receipt_path ? (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
                gap={2}
              >
                <Box>
                  <Button
                    variant="outlined"
                    startIcon={
                      <VisibilityIcon />
                    }
                    sx={{
                      mr: 2,
                      borderColor: "#2D6A4F",
                      color: "#2D6A4F",
                      marginTop: "10px"
                    }}
                    onClick={viewReceipt}
                  >
                    View
                  </Button>

                  <Button
                    variant="contained"
                    startIcon={
                      <DownloadIcon />
                    }
                    sx={{
                      background: "#2D6A4F",
                        marginTop: "10px"
                    }}
                    onClick={downloadReceipt}
                  >
                    Download
                  </Button>
                </Box>
              </Box>
            ) : (
              <Typography
                color="text.secondary"
              >
                No Receipt Uploaded
              </Typography>
            )}
          </Paper>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

export default ExpenseDetails;