import { useEffect, useState } from "react";
import { Card, CardContent, Typography } from "@mui/material";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../api/api";

function Reports() {
  const [report, setReport] = useState(null);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    const response = await api.get("/reports/employee_summary");

    setReport(response.data);
  };

  return (
    <DashboardLayout>
      <Card>
        <CardContent>
          <Typography variant="h5">Employee Report</Typography>

          <Typography>Total Amount: ₹{report?.total_amount || 0}</Typography>

          <Typography>
            Expense Count:
            {report?.expense_count || 0}
          </Typography>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

export default Reports;