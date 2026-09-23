import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, roles = [] }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (roles.length > 0 && !roles.includes(user.rol)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}