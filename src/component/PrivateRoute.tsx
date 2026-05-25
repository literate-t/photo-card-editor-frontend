import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return accessToken ? <>{children}</> : <Navigate to="/login" replace />;
}
