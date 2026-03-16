import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const AuthContext = createContext(null);
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

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
      if (res.ok) {
        const data = await res.json();
        if (data.token && data.admin) {
          localStorage.setItem("fw_admin_token", data.token);
          localStorage.setItem("fw_admin_user", JSON.stringify(data.admin));
          setUser(data.admin);
          return data.admin;
        }
      }
    } catch {}
    throw new Error("Invalid credentials");
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
