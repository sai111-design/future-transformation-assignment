import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import PrivateRoute from "./routes/PrivateRoute";
import AdminRoute from "./routes/AdminRoute";
import Login from "./pages/Login";
import Tasks from "./pages/Tasks";
import TaskNew from "./pages/TaskNew";
import Documents from "./pages/Documents";
import Search from "./pages/Search";
import Analytics from "./pages/Analytics";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/tasks" replace />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/search" element={<Search />} />
          <Route element={<AdminRoute />}>
            <Route path="/tasks/new" element={<TaskNew />} />
            <Route path="/analytics" element={<Analytics />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
