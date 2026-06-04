import { useState, type FormEvent } from "react";
import { search, type SearchResult } from "../api/search";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await search(query.trim());
      setResults(data);
      setExpandedId(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Semantic Search</h1>
      <form onSubmit={handleSearch} className="flex space-x-3 mb-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search documents..."
          className="flex-1 border border-gray-300 rounded px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white rounded px-5 py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-gray-500">Searching...</p>
      ) : searched && results.length === 0 ? (
        <p className="text-sm text-gray-500">No results found.</p>
      ) : (
        <div className="space-y-3">
          {results.map((r) => (
            <div
              key={r.document_id}
              onClick={() =>
                setExpandedId(
                  expandedId === r.document_id ? null : r.document_id
                )
              }
              className="bg-white shadow rounded-lg p-4 cursor-pointer hover:ring-2 hover:ring-indigo-300"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-medium">{r.title}</h2>
                <span className="text-xs font-mono text-gray-400">
                  score: {r.score.toFixed(3)}
                </span>
              </div>
              <p
                className={`text-sm text-gray-600 mt-2 ${
                  expandedId === r.document_id ? "" : "line-clamp-2"
                }`}
              >
                {r.snippet}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
