import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { isLoggedIn, isAdmin } from "../utils/auth";

const AdminRoute = ({ children }) => {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  if (!isAdmin()) {
    return <Navigate to="/products" replace />;
  }
  return children ? children : <Outlet />;
};

export default AdminRoute;
