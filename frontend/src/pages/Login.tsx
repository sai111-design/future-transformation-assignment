import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";

const DEMO_ACCOUNTS = [
  { label: "Admin", email: "admin@demo.com", password: "AdminPass123!" },
  { label: "User", email: "user@demo.com", password: "UserPass123!" },
];

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: string, p: string) {
    setError("");
    setLoading(true);
    try {
      await login(e, p);
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submit(email, password);
  }

  async function fillAndLogin(acct: { email: string; password: string }) {
    setEmail(acct.email);
    setPassword(acct.password);
    await submit(acct.email, acct.password);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow rounded-lg p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6">FTMS Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="admin@demo.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white rounded py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 border-t pt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Demo Credentials
          </p>
          <div className="space-y-2">
            {DEMO_ACCOUNTS.map((acct) => (
              <div
                key={acct.email}
                className="flex items-center justify-between rounded border border-gray-200 bg-gray-50 px-3 py-2 text-xs"
              >
                <div className="font-mono text-gray-700">
                  <div>{acct.email}</div>
                  <div className="text-gray-500">{acct.password}</div>
                </div>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => fillAndLogin(acct)}
                  className="ml-3 shrink-0 rounded bg-indigo-600 px-2 py-1 text-white text-xs font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  Use {acct.label}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
