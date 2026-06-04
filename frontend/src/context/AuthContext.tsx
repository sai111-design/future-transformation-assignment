import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import * as authApi from "../api/auth";

interface AuthState {
  token: string | null;
  role: string | null;
  userId: number | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("access_token")
  );
  const [role, setRole] = useState<string | null>(
    () => localStorage.getItem("role")
  );
  const [userId, setUserId] = useState<number | null>(() => {
    const v = localStorage.getItem("user_id");
    return v ? Number(v) : null;
  });

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await authApi.login(email, password);
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("user_id", String(data.user_id));
      setToken(data.access_token);
      setRole(data.role);
      setUserId(data.user_id);
      navigate("/tasks");
    },
    [navigate]
  );

  const logout = useCallback(() => {
    localStorage.clear();
    setToken(null);
    setRole(null);
    setUserId(null);
    navigate("/login");
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ token, role, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
