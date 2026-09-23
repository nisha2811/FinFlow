import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import {
  useEffect,
  useState,
} from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../api/api";
import StatCard from "../components/StatCard";
import Loader from "../components/Loader";
import CategoryChart from "../components/CategoryChart";

function EmployeeDashboard() 
{
  const [dashboard, setDashboard] = useState(null);
  const [categoryData, setCategoryData,] = useState([]);
  const [loading, setLoading,] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try 
    {
      const dashboardResponse = await api.get("/dashboard/employee_dashboard");
      setDashboard(dashboardResponse.data);
      try 
      {
        const categoryResponse = await api.get("/reports/category-wise");
        setCategoryData(categoryResponse.data);
      } 
      catch (error) 
      {
        console.log(error);
      }
      setLoading(false);
    } 
    catch (error) 
    {
      console.error(error);
      setLoading(false);
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

  return (
    <DashboardLayout>
      <Box mb={4}>
        <Typography
          variant="h4"
          fontWeight="700"
          sx={{
            color: "#1B4332",
          }}
        >
          <b>Welcome 👋</b>
        </Typography>
        <br></br>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 10, md: 3 }}>
          <StatCard
            title="Total Expenses"
            value={dashboard?.total_expenses || 0}
            color="#2D6A4F"
          />
        </Grid>

        <Grid size={{ xs: 10, md: 3 }}>
          <StatCard
            title="Approved"
            value={dashboard?.approved || 0}
            color="#52B788"
          />
        </Grid>

        <Grid size={{ xs: 10, md: 3 }}>
          <StatCard
            title="Rejected"
            value={dashboard?.rejected || 0}
            color="#D62828"
          />
        </Grid>

        <Grid size={{ xs: 10, md: 3 }}>
          <StatCard
            title="Pending"
            value={dashboard?.pending || 0}
            color="#FFB703"
          />
        </Grid>
      </Grid>

      <br />

      <Grid container spacing={3}>
        <Grid size={{ xs: 10, md: 8 }}>
          <Card
            sx={{
              borderRadius: 5,
              height: "100%",
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            }}
          >
            <CardContent>
              <Typography
                variant="h5"
                fontWeight="700"
                sx={{
                      color: "#1B4332",
                      marginLeft: "10px"
                }}
              >
                <b>Expense Analytics</b>
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                mb={3}
              >
                <br></br>
                <center>Expense distribution by category</center>
              </Typography>

              <CategoryChart
                data={categoryData}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 10, md: 4 }}>
          <Card
            sx={{
              borderRadius: 5,
              height: "50%",
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
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
                <b>Expense Reports</b>
              </Typography>

              <Divider sx={{ mb: 3 }} />

              <Box mb={3}>
                <Typography color="text.secondary">
                  <b>Total Amount :  </b>
                  <span
                    style={{
                      color: "#2D6A4F",
                      fontSize: "1.5rem",
                      fontWeight: 700,
                    }}
                  >
                    ₹{dashboard?.total_amount || 0}
                  </span>
                </Typography>  
              </Box>

              <Box mb={3}>
              <Typography color="text.secondary"> 
                <b>Expense Count : </b>
                    <span
                    style={{
                      color: "#2D6A4F",
                      fontSize: "1.5rem",
                      fontWeight: 700,
                    }}
                  >
                    {dashboard?.total_expenses || 0}
                  </span>
              </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
}

export default EmployeeDashboard;