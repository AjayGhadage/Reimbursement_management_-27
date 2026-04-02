import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

import Layout from "./components/Layout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ExpenseSubmit from "./pages/ExpenseSubmit";
import ApprovalsQueue from "./pages/ApprovalsQueue";
import AdminRules from "./pages/AdminRules";
import AdminUsers from "./pages/AdminUsers";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import About from "./pages/About";

function PrivateRoute({ children, allowRoles }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowRoles && !allowRoles.includes(user.role)) return <Navigate to="/" replace />;
  
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/about" element={<About />} />

      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="submit" element={<ExpenseSubmit />} />
        <Route 
          path="approvals" 
          element={
            <PrivateRoute allowRoles={["ADMIN", "MANAGER", "FINANCE", "DIRECTOR"]}>
              <ApprovalsQueue />
            </PrivateRoute>
          } 
        />
        <Route path="admin/rules" element={
          <PrivateRoute allowRoles={['ADMIN']}>
            <AdminRules />
          </PrivateRoute>
        } />
        <Route path="admin/users" element={
          <PrivateRoute allowRoles={['ADMIN']}>
            <AdminUsers />
          </PrivateRoute>
        } />
      </Route>
    </Routes>
  );
}