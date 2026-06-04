import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { listTasks, updateTaskStatus, type Task } from "../api/tasks";

export default function Tasks() {
  const { role, userId } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const filters: { status?: string } = {};
    if (filter) filters.status = filter;
    listTasks(filters)
      .then(setTasks)
      .finally(() => setLoading(false));
  }, [filter]);

  async function handleMarkComplete(id: number) {
    const updated = await updateTaskStatus(id, "completed");
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Tasks</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm"
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : tasks.length === 0 ? (
        <p className="text-sm text-gray-500">No tasks found.</p>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white shadow rounded-lg p-4 flex items-start justify-between"
            >
              <div>
                <h2 className="font-medium">{task.title}</h2>
                {task.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {task.description}
                  </p>
                )}
                <div className="flex items-center space-x-2 mt-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      task.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {task.status}
                  </span>
                  <span className="text-xs text-gray-400">
                    Assigned to user #{task.assigned_to}
                  </span>
                </div>
              </div>
              {task.status === "pending" &&
                (role === "admin" || task.assigned_to === userId) && (
                  <button
                    onClick={() => handleMarkComplete(task.id)}
                    className="ml-4 shrink-0 bg-indigo-600 text-white rounded px-3 py-1.5 text-xs font-medium hover:bg-indigo-700"
                  >
                    Mark Complete
                  </button>
                )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
