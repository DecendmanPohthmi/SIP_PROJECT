import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import AdminHome from "./pages/AdminHome";
import AdminLogin from "./pages/AdminLoginPage";
import AdminLayout from "./components/sidebar";
import ProtectedRoute from "./context/Protectedroute";
import AdminNavbar from "./components/navbar";
import AdminProfile from "./pages/adminProfile";
import AdminOrganisers from "./pages/AdminOrganiser";
import AdminEvents from "./pages/AdminEvent";
import AdminUsers from "./pages/AdminUser";
import AdminRefunds from "./pages/AdminRefunds";
import AdminWithdrawals from "./pages/AdminWithdrawals";
import AdminDashboard from "./pages/admindashboard";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AdminNavbar />

        <Routes>
          <Route path="/" element={<AdminHome />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            {/* Index route renders Dashboard by default when visiting /admin */}
            <Route index element={<AdminDashboard />} />
            
            {/* Nested relative paths (NOTICE: No leading slashes) */}
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="organisers" element={<AdminOrganisers />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="refunds" element={<AdminRefunds />} />
            <Route path="withdrawals" element={<AdminWithdrawals />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;