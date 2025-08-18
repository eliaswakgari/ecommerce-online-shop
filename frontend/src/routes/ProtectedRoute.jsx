import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  // Not logged in → send to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin-only route but user is not admin → send to home
  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // Otherwise → show the protected component
  return children;
}
