import { useEffect, useState } from "react";
import { getAnalytics, type AnalyticsData } from "../api/analytics";

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-gray-500">Loading...</p>;
  if (!data) return <p className="text-sm text-red-600">Failed to load analytics.</p>;

  const cards = [
    { label: "Total Tasks", value: data.total_tasks, color: "bg-blue-50 text-blue-700" },
    { label: "Completed", value: data.completed_tasks, color: "bg-green-50 text-green-700" },
    { label: "Pending", value: data.pending_tasks, color: "bg-yellow-50 text-yellow-700" },
  ];

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Analytics</h1>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`rounded-lg p-6 text-center ${c.color}`}
          >
            <p className="text-3xl font-bold">{c.value}</p>
            <p className="text-sm mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-3">Top Search Queries</h2>
      {data.top_search_queries.length === 0 ? (
        <p className="text-sm text-gray-500">No searches recorded yet.</p>
      ) : (
        <div className="bg-white shadow rounded-lg divide-y">
          {data.top_search_queries.map((q, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm">{q.query}</span>
              <span className="text-xs font-mono text-gray-400">
                {q.count} {q.count === 1 ? "search" : "searches"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
