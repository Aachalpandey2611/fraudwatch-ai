import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const EmployeeAuthContext = createContext(null);
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export function EmployeeAuthProvider({ children }) {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("fw_employee_user");
    if (saved) {
      try {
        setEmployee(JSON.parse(saved));
      } catch {}
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (identity, password) => {
    const response = await fetch(`${API_BASE}/api/auth/employee-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: identity,
        employeeId: identity,
        username: identity,
        name: identity,
        password,
      }),
    });

    if (!response.ok) {
      throw new Error("Invalid credentials");
    }

    const data = await response.json();
    if (!data?.token || !data?.employee) {
      throw new Error("Invalid login response");
    }

    localStorage.setItem("fw_employee_token", data.token);
    localStorage.setItem("fw_employee_user", JSON.stringify(data.employee));
    setEmployee(data.employee);
    return data.employee;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("fw_employee_token");
    localStorage.removeItem("fw_employee_user");
    setEmployee(null);
  }, []);

  return (
    <EmployeeAuthContext.Provider value={{ employee, loading, login, logout }}>
      {!loading && children}
    </EmployeeAuthContext.Provider>
  );
}

export const useEmployeeAuth = () => useContext(EmployeeAuthContext);
