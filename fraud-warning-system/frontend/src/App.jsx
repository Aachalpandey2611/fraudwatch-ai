import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import {
  EmployeeAuthProvider,
  useEmployeeAuth,
} from "./context/EmployeeAuthContext";
import AdminLogin from "./pages/AdminLogin.jsx";
import EmployeeLogin from "./pages/EmployeeLogin.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Alerts from "./pages/Alerts.jsx";
import Activities from "./pages/Activities.jsx";
import Investigation from "./pages/Investigation.jsx";
import Settings from "./pages/Settings.jsx";
import LiveDemo from "./pages/LiveDemo.jsx";
import EmployeePortal from "./pages/EmployeePortal.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";
import Chatbot from "./components/Chatbot.jsx";

const AdminShell = ({ children }) => (
  <div
    style={{
      display: "flex",
      height: "100vh",
      overflow: "hidden",
      background: "#0a0e1a",
    }}
  >
    <Sidebar />
    <div className="flex-1 flex flex-col overflow-hidden">
      <Topbar />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
    <Chatbot />
  </div>
);

const EmployeeShell = ({ children }) => {
  const { employee, logout } = useEmployeeAuth();
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0e1a",
        color: "#fff",
      }}
    >
      <header
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(15,22,41,0.92)",
        }}
      >
        <div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Employee Portal</div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>
            {employee?.name} • {employee?.department}
          </div>
        </div>
        <button
          onClick={logout}
          style={{
            border: "1px solid rgba(255,255,255,0.2)",
            background: "transparent",
            color: "#cbd5e1",
            borderRadius: 10,
            padding: "8px 12px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </header>
      <main style={{ padding: 20 }}>{children}</main>
    </div>
  );
};

const AdminProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const token = localStorage.getItem("fw_admin_token");
  if (!user || !token) return <Navigate to="/admin/login" replace />;
  if (user.role !== "admin") return <Navigate to="/admin/login" replace />;
  return <AdminShell>{children}</AdminShell>;
};

const EmployeeProtectedRoute = ({ children }) => {
  const { employee } = useEmployeeAuth();
  if (!employee) return <Navigate to="/employee/login" replace />;
  if (employee.role !== "employee")
    return <Navigate to="/employee/login" replace />;
  return <EmployeeShell>{children}</EmployeeShell>;
};

export default function App() {
  return (
    <AuthProvider>
      <EmployeeAuthProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#1a2540",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.1)",
              },
            }}
          />
          <Routes>
            <Route path="/" element={<Navigate to="/admin/login" replace />} />

            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={
                <AdminProtectedRoute>
                  <Dashboard />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/alerts"
              element={
                <AdminProtectedRoute>
                  <Alerts />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/activities"
              element={
                <AdminProtectedRoute>
                  <Activities />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/investigation"
              element={
                <AdminProtectedRoute>
                  <Investigation />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <AdminProtectedRoute>
                  <Settings />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/demo"
              element={
                <AdminProtectedRoute>
                  <LiveDemo />
                </AdminProtectedRoute>
              }
            />

            <Route path="/employee/login" element={<EmployeeLogin />} />
            <Route
              path="/employee/dashboard"
              element={
                <EmployeeProtectedRoute>
                  <EmployeePortal />
                </EmployeeProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/admin/login" replace />} />
          </Routes>
        </Router>
      </EmployeeAuthProvider>
    </AuthProvider>
  );
}
