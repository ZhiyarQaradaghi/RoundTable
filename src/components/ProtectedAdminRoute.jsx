import { useAdminAuth } from "../context/AdminAuthContext";
import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";

export default function ProtectedAdminRoute({ children }) {
  const { admin } = useAdminAuth();
  if (!admin) {
    return <Navigate to="/admin-login" replace />;
  }
  return children;
}

ProtectedAdminRoute.propTypes = {
  children: PropTypes.node.isRequired,
};
