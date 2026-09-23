import { useEffect, useState } from "react";
import {
  Grid,
  Typography,
  Card,
  CardContent,
  Divider,
  Box,
} from "@mui/material";
import DashboardLayout from "../layouts/DashboardLayout";
import StatCard from "../components/StatCard";
import CategoryChart from "../components/CategoryChart";
import EmployeeChart from "../components/EmployeeChart";
import Loader from "../components/Loader";
import api from "../api/api";

function ManagerDashboard() {
  const [data, setData] = useState({});
  const [categoryData, setCategoryData] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [dashboardResponse, categoryResponse, employeeResponse] =
          await Promise.all([
            api.get("/dashboard/manager_dashboard"),
            api.get("/reports/category-wise"),
            api.get("/reports/employee-wise"),
          ]);
        setData(dashboardResponse.data);
        setCategoryData(categoryResponse.data || []);
        setEmployeeData(employeeResponse.data || []);
      } finally {
        setLoading(false);
      }
    };
    loadData().catch((error) => console.error(error));
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Manager Dashboard" subtitle="Monitor your assigned team expenses.">
        <Loader />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Manager Dashboard"
      subtitle="Monitor your assigned team expenses and approvals."
    >
      

      <Grid container spacing={3}>
        <Grid size={{ xs: 10, md: 3 }}>
          <StatCard title="Team Expenses" value={data.total_expenses || 0} color="#2D6A4F" /></Grid>
        <Grid size={{ xs: 10, md: 3 }}><StatCard title="Approved" value={data.approved || 0} color="#52B788" /></Grid>
        <Grid size={{ xs: 10, md: 3 }}><StatCard title="Rejected" value={data.rejected || 0} color="#D62828" /></Grid>
        <Grid size={{ xs: 10, md: 3 }}><StatCard title="Pending" value={data.pending || 0} color="#FFB703" /></Grid>
      </Grid>
      <br/>

      <Grid container spacing={3} mt={1}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ borderRadius: 5, height: "100%", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
            <CardContent>
              <Typography
                variant="h5"
                fontWeight="700"
                sx={{
                  color: "#1B4332",
                  marginLeft: "10px"
                }}
              >
                <b>Team Expense Analytics</b>
              </Typography>
              <Typography
                              variant="body2"
                              color="text.secondary"
                              mb={3}
                            >
                              <br></br>
                              <center>Expense distribution by category</center>
                            </Typography>
              <CategoryChart data={categoryData} />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 10, md: 4 }}>
          <Card sx={{ borderRadius: 5, height: "100%", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
            <CardContent>
              <Typography
                
                fontWeight="700"
                mb={3}
                sx={{
                  color: "#1B4332",
                  fontSize:"1.3rem",
                  paddingTop : 1.5
                }}
              >
                <b>Team Summary</b>
              </Typography>
              <Divider sx={{ my: 3 }} />
              <Box mb={3}>
                <Typography color="text.secondary">
                  <b>
                    Total Amount :
                  </b>{" "}
                  <span
                    style={{
                      color: "#2D6A4F",
                      fontSize: "1rem",
                      fontWeight: 700,
                    }}
                  >
                    ₹
                    {data.total_amount || 0}
                  </span>
                </Typography>
              </Box>

              <Box mb={3}>
                <Typography color="text.secondary">
                  <b>
                    Expense Count :
                  </b>{" "}
                  <span
                    style={{
                      color: "#2D6A4F",
                      fontSize: "1rem",
                      fontWeight: 700,
                    }}
                  >
              {data.highest_expense || 0}
                </span>
                </Typography>
              </Box>
              <Divider sx={{ my: 4 }} />

              <Typography
                fontWeight="700"
                sx={{
                  color: "#1B4332",
                  mb: 2,
                  fontSize:"1.3rem",
                }}
              >
                <b>Key Insights</b>
              </Typography>

              <Box mb={3}>
                <Typography color="text.secondary">
                  <b>
                    Most Used Category :
                  </b>{" "}
                  <span
                    style={{
                      color: "#2D6A4F",
                      fontSize: "1rem",
                      fontWeight: 700,
                    }}
                  >
                    {data.most_used_category}
                  </span>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 12, }}>
          <Card sx={{ borderRadius: 5, boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
            <CardContent>
              <Typography
                variant="h5"
                fontWeight="700"
                sx={{
                  color: "#1B4332",
                }}
              >
                <b>Employee Expense Distribution</b>
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                mb={3}
              >
                <br></br>
                <center> Expense count by employee</center>
              </Typography>
              <EmployeeChart data={employeeData} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
}

export default ManagerDashboard;
