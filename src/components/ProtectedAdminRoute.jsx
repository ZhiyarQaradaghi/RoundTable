import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import { Box, CircularProgress } from "@mui/material";
import React from "react";

export default function ProtectedAdminRoute({ children }) {
  const { user, loading, isInitialized } = useAuth();

  if (!isInitialized || loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  const adminProps = {
    user: {
      ...user,
      role: user.role || "user",
    },
  };

  return React.Children.map(children, (child) => {
    return React.cloneElement(child, adminProps);
  });
}

ProtectedAdminRoute.propTypes = {
  children: PropTypes.node.isRequired,
};
