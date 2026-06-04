import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NavBar() {
  const { role, logout } = useAuth();
  const location = useLocation();

  const links = [
    { to: "/tasks", label: "Tasks" },
    { to: "/documents", label: "Documents" },
    { to: "/search", label: "Search" },
    ...(role === "admin"
      ? [
          { to: "/tasks/new", label: "New Task" },
          { to: "/analytics", label: "Analytics" },
        ]
      : []),
  ];

  return (
    <nav className="sticky top-0 z-10 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
        <div className="flex items-center space-x-6">
          <Link to="/tasks" className="text-lg font-semibold text-indigo-600">
            FTMS
          </Link>
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-sm font-medium ${
                location.pathname === l.to
                  ? "text-indigo-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center space-x-3">
          <span className="rounded-full bg-indigo-100 text-indigo-700 px-2 py-0.5 text-xs font-medium">
            {role}
          </span>
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
