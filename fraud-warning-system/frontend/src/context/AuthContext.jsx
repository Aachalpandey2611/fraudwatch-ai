import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const AuthContext = createContext(null);
const DEFAULT_API_BASE = import.meta.env.PROD
  ? "https://fraudwatch-backend.onrender.com"
  : "http://localhost:4000";
const API_BASE = import.meta.env.VITE_API_URL || DEFAULT_API_BASE;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("fw_admin_user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {}
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (username, password) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/admin-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: username, username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.token && data.admin) {
        localStorage.setItem("fw_admin_token", data.token);
        localStorage.setItem("fw_admin_user", JSON.stringify(data.admin));
        setUser(data.admin);
        return data.admin;
      }
      if (res.status === 401) {
        throw new Error("Invalid admin credentials");
      }
      if (res.status >= 500) {
        throw new Error(
          "Backend is unavailable. Please check Render service status.",
        );
      }
      throw new Error(data?.message || "Login failed");
    } catch (error) {
      // Preserve intentional API errors; only map true network failures.
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(
        "Unable to reach backend. Set VITE_API_URL to your Render backend URL and redeploy frontend.",
      );
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("fw_admin_user");
    localStorage.removeItem("fw_admin_token");
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
