import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext.tsx";

// Wrap any admin-only route with this. Redirects to /admin/login if
// there's no token, or if the logged-in user isn't an admin.
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, isAdmin, loading } = useAuth();

  if (loading) {
    // AuthContext is still reading localStorage on first mount.
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">
        Loading...
      </div>
    );
  }

  if (!isLoggedIn || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;