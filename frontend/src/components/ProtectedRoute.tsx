import { Navigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

interface Props {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: Props) => {
  const location = useLocation();
  
  const token = localStorage.getItem("accessToken");
  const userRole = localStorage.getItem("userRole")?.toUpperCase();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && (!userRole || !allowedRoles.includes(userRole))) {
    toast.error("You are not authorized to access this section.");
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
