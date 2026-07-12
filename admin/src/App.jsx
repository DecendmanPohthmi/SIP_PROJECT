import React from "react";
import AdminNavbar from "./components/navbar.tsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminDashboard from "./pages/admindashboard.tsx";
import AdminHome from "./pages/homepage.tsx";
import AdminProfile from "./pages/adminProfile.tsx";
import AdminLogin from "./pages/AdminLoginPage.tsx";
import AdminOrganisers from "./pages/organiserPage.tsx";
import AdminEvents from "./pages/eventPage.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import ProtectedRoute from "./context/Protectedroute.tsx";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AdminNavbar />
        <Routes>
          <Route path="/" element={<AdminHome />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute>
                <AdminProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/organisers"
            element={
              <ProtectedRoute>
                <AdminOrganisers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events"
            element={
              <ProtectedRoute>
                <AdminEvents />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;