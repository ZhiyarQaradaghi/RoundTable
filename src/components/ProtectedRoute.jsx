import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";

function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
