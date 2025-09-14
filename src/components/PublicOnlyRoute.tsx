import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";

export default function PublicOnlyRoute() {
  const { token } = useAuth();
  if (token) return <Navigate to="/resources" replace />;
  return <Outlet />;
}
