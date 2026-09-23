import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import ExpenseDetails from "./pages/ExpenseDetails";
import EditExpense from "./pages/EditExpense";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Expenses from "./pages/Expenses";
import CreateExpense from "./pages/CreateExpense";
import Reports from "./pages/Reports";
import ManagerExpenses from "./pages/ManagerExpenses";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import TeamAssignments from "./pages/TeamAssignments";
import MyEmployees from "./pages/MyEmployees";
import AdminUserManagement from "./pages/AdminUserManagement";

function App() {
  const role = localStorage.getItem("role");

  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "EMPLOYEE"]}>
              {role === "ADMIN" ? (
                <AdminDashboard />
              ) : role === "MANAGER" ? (
                <ManagerDashboard />
              ) : (
                <EmployeeDashboard />
              )}
            </ProtectedRoute>
          }
        />

        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <Expenses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-expense"
          element={
            <ProtectedRoute>
              <CreateExpense />
            </ProtectedRoute>
          }
        />

        <Route
          path="/approvals"
          element={
            <ProtectedRoute>
              <ManagerExpenses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user-management"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminUserManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/team-assignments"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <TeamAssignments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-employees"
          element={
            <ProtectedRoute allowedRoles={["MANAGER"]}>
              <MyEmployees />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/expense/:id"
          element={
            <ProtectedRoute>
              <ExpenseDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/expense/edit/:id"
          element={
            <ProtectedRoute>
              <EditExpense />
            </ProtectedRoute>
          }
        />

        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
