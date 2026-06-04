import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute() {
  const { role } = useAuth();
  if (role !== "admin") {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-300">403</h1>
          <p className="mt-4 text-lg text-gray-600">
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    );
  }
  return <Outlet />;
}
