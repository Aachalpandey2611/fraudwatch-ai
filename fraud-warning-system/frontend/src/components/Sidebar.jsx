import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  AlertTriangle,
  Activity,
  Search,
  PlayCircle,
  Settings,
  Shield,
  LogOut,
  ChevronRight,
} from "lucide-react";

const navItems = [
  {
    path: "/admin/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    roles: ["admin"],
  },
  {
    path: "/admin/alerts",
    icon: AlertTriangle,
    label: "Alerts",
    roles: ["admin"],
  },
  {
    path: "/admin/activities",
    icon: Activity,
    label: "Activities",
    roles: ["admin"],
  },
  {
    path: "/admin/investigation",
    icon: Search,
    label: "Investigation",
    roles: ["admin"],
  },
  {
    path: "/demo",
    icon: PlayCircle,
    label: "Live Demo",
    roles: ["admin"],
  },
  {
    path: "/admin/settings",
    icon: Settings,
    label: "Settings",
    roles: ["admin"],
  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{
        width: "256px",
        background: "rgba(15,22,41,0.97)",
        backdropFilter: "blur(16px)",
        borderRight: "1px solid rgba(255,255,255,0.05)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "24px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="logo-pulse"
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "rgba(59,130,246,0.2)",
              border: "1px solid rgba(59,130,246,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1
              style={{
                color: "#fff",
                fontWeight: 700,
                fontSize: 15,
                lineHeight: 1.2,
              }}
            >
              FraudWatch
            </h1>
            <p style={{ color: "#64748b", fontSize: 11 }}>AI Fraud Detection</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav
        style={{
          flex: 1,
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <p
          style={{
            color: "#475569",
            fontSize: 10,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            padding: "0 14px",
            marginBottom: 8,
          }}
        >
          Main Menu
        </p>
        {navItems
          .filter((item) => item.roles.includes(user?.role))
          .map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin/dashboard"}
              className={({ isActive }) =>
                `nav-item${isActive ? " active" : ""}`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={18} />
                  <span>{item.label}</span>
                  {isActive && (
                    <ChevronRight
                      className="ml-auto"
                      size={14}
                      style={{ color: "#60a5fa" }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
      </nav>

      {/* Live indicator */}
      <div
        style={{
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div
          className="live-dot"
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#22c55e",
          }}
        />
        <span style={{ color: "#22c55e", fontSize: 11 }}>System Live</span>
      </div>

      {/* User Profile */}
      <div
        style={{
          padding: "16px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div
          className="glass-card"
          style={{
            padding: "12px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 700,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {user?.name?.charAt(0) || "A"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                color: "#fff",
                fontSize: 13,
                fontWeight: 500,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.name}
            </p>
            <p
              style={{
                color: "#64748b",
                fontSize: 11,
                textTransform: "capitalize",
              }}
            >
              {user?.role}
            </p>
          </div>
          <button
            onClick={logout}
            style={{
              color: "#64748b",
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
