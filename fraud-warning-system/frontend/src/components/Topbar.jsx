import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Search,
  AlertTriangle,
  X,
  User,
  Shield,
  Activity,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function Topbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      name: "Marcus Thompson",
      risk: 96,
      type: "bulk_download",
      time: "2 min ago",
    },
    {
      id: 2,
      name: "David Chen",
      risk: 88,
      type: "privilege_escalation",
      time: "15 min ago",
    },
    {
      id: 3,
      name: "James Okafor",
      risk: 83,
      type: "report_generation",
      time: "1 hour ago",
    },
  ]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [time, setTime] = useState(new Date());
  const [searchVal, setSearchVal] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState({
    employees: [],
    alerts: [],
    activities: [],
  });
  const [liveAlerts, setLiveAlerts] = useState([]);
  const [liveActivities, setLiveActivities] = useState([]);
  const notifRef = useRef(null);
  const searchRef = useRef(null);

  // Fetch live data for search when user is logged in
  useEffect(() => {
    if (!user) return;
    api
      .get("/api/alerts?limit=100")
      .then(({ data }) => {
        if (data.success && data.data?.length) setLiveAlerts(data.data);
      })
      .catch(() => {});
    api
      .get("/api/activities?limit=100")
      .then(({ data }) => {
        if (data.success && data.data?.length) setLiveActivities(data.data);
      })
      .catch(() => {});
  }, [user]);

  // Search functionality: use only live data from MongoDB
  useEffect(() => {
    if (searchVal.trim().length < 2) {
      setSearchResults({ employees: [], alerts: [], activities: [] });
      setShowSearch(false);
      return;
    }
    const q = searchVal.toLowerCase();
    const allPeople = [];
    liveAlerts.forEach((a) => {
      if (a.employeeName)
        allPeople.push({
          name: a.employeeName,
          dept: a.department || "",
          role: a.role || "",
        });
    });
    liveActivities.forEach((a) => {
      if (a.employeeName && !allPeople.some((p) => p.name === a.employeeName)) {
        allPeople.push({
          name: a.employeeName,
          dept: a.department || "",
          role: a.role || "",
        });
      }
    });
    const employees = allPeople
      .filter(
        (e) =>
          (e.name || "").toLowerCase().includes(q) ||
          (e.dept || "").toLowerCase().includes(q) ||
          (e.role || "").toLowerCase().includes(q),
      )
      .slice(0, 3);
    const alerts = liveAlerts
      .filter(
        (a) =>
          (a.employeeName || "").toLowerCase().includes(q) ||
          (a.department || "").toLowerCase().includes(q) ||
          (a.alertId || "").toLowerCase().includes(q),
      )
      .slice(0, 3);
    const activities = liveActivities
      .filter(
        (a) =>
          (a.employeeName || "").toLowerCase().includes(q) ||
          (a.actionType || "").toLowerCase().includes(q),
      )
      .slice(0, 2);
    setSearchResults({ employees, alerts, activities });
    setShowSearch(true);
  }, [searchVal, liveAlerts, liveActivities]);

  // Close search when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    }
    if (showSearch) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSearch]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifs(false);
      }
    }
    if (showNotifs) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifs]);

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <header
      style={{
        height: 64,
        background: "rgba(15,22,41,0.98)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        flexShrink: 0,
        position: "relative",
        zIndex: 1000,
      }}
    >
      {/* Search */}
      <div
        ref={searchRef}
        style={{ flex: 1, maxWidth: 400, position: "relative" }}
      >
        <Search
          size={16}
          style={{
            position: "absolute",
            left: 14,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#64748b",
            pointerEvents: "none",
          }}
        />
        <input
          type="text"
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          placeholder="Search employees, alerts, activities..."
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            padding: "10px 16px 10px 42px",
            color: "#fff",
            fontSize: 13,
            outline: "none",
            transition: "all 0.2s",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "rgba(59,130,246,0.5)";
            e.target.style.background = "rgba(255,255,255,0.06)";
            if (searchVal.trim().length >= 2) setShowSearch(true);
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "rgba(255,255,255,0.08)";
            e.target.style.background = "rgba(255,255,255,0.04)";
          }}
        />
        <AnimatePresence>
          {showSearch &&
            (searchResults.employees.length > 0 ||
              searchResults.alerts.length > 0 ||
              searchResults.activities.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  left: 0,
                  right: 0,
                  background: "rgba(15,22,41,0.98)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                  zIndex: 10001,
                  overflow: "hidden",
                  maxHeight: 400,
                  overflowY: "auto",
                }}
              >
                {searchResults.employees.length > 0 && (
                  <div>
                    <div
                      style={{
                        padding: "10px 16px",
                        color: "#64748b",
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <User
                        size={12}
                        style={{ display: "inline", marginRight: 6 }}
                      />{" "}
                      Employees
                    </div>
                    {searchResults.employees.map((emp, idx) => (
                      <div
                        key={emp.name + "-" + idx}
                        onClick={() => {
                          navigate("/admin/activities");
                          setShowSearch(false);
                          setSearchVal("");
                        }}
                        style={{
                          padding: "12px 16px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "rgba(255,255,255,0.05)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        <div>
                          <p
                            style={{
                              color: "#fff",
                              fontSize: 13,
                              fontWeight: 500,
                            }}
                          >
                            {emp.name}
                          </p>
                          <p style={{ color: "#64748b", fontSize: 11 }}>
                            {emp.dept} • {emp.role}
                          </p>
                        </div>
                        {emp.risk != null && (
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color:
                                emp.risk >= 75
                                  ? "#f87171"
                                  : emp.risk >= 40
                                    ? "#facc15"
                                    : "#4ade80",
                            }}
                          >
                            {emp.risk}%
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {searchResults.alerts.length > 0 && (
                  <div>
                    <div
                      style={{
                        padding: "10px 16px",
                        color: "#64748b",
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        borderTop: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <Shield
                        size={12}
                        style={{ display: "inline", marginRight: 6 }}
                      />{" "}
                      Alerts
                    </div>
                    {searchResults.alerts.map((alert) => (
                      <div
                        key={alert._id}
                        onClick={() => {
                          navigate("/admin/alerts");
                          setShowSearch(false);
                          setSearchVal("");
                        }}
                        style={{
                          padding: "12px 16px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "rgba(255,255,255,0.05)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        <div>
                          <p
                            style={{
                              color: "#fff",
                              fontSize: 13,
                              fontWeight: 500,
                            }}
                          >
                            {alert.alertId}
                          </p>
                          <p style={{ color: "#64748b", fontSize: 11 }}>
                            {alert.employeeName} •{" "}
                            {alert.activityType.replace(/_/g, " ")}
                          </p>
                        </div>
                        <span className={`badge-${alert.severity}`}>
                          {alert.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {searchResults.activities.length > 0 && (
                  <div>
                    <div
                      style={{
                        padding: "10px 16px",
                        color: "#64748b",
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        borderTop: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <Activity
                        size={12}
                        style={{ display: "inline", marginRight: 6 }}
                      />{" "}
                      Activities
                    </div>
                    {searchResults.activities.map((act) => (
                      <div
                        key={act._id}
                        onClick={() => {
                          navigate("/admin/activities");
                          setShowSearch(false);
                          setSearchVal("");
                        }}
                        style={{
                          padding: "12px 16px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "rgba(255,255,255,0.05)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        <div>
                          <p
                            style={{
                              color: "#fff",
                              fontSize: 13,
                              fontWeight: 500,
                            }}
                          >
                            {act.employeeName}
                          </p>
                          <p style={{ color: "#64748b", fontSize: 11 }}>
                            {act.actionType.replace(/_/g, " ")} •{" "}
                            {act.systemAccessed}
                          </p>
                        </div>
                        {act.isAnomaly && (
                          <span
                            style={{
                              fontSize: 10,
                              color: "#f87171",
                              background: "rgba(239,68,68,0.15)",
                              padding: "2px 8px",
                              borderRadius: 10,
                            }}
                          >
                            ANOMALY
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* Live clock */}
        <div
          style={{
            fontFamily: "monospace",
            color: "#94a3b8",
            fontSize: 13,
            background: "rgba(255,255,255,0.04)",
            padding: "6px 12px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {time.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </div>

        {/* System Active */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(34,197,94,0.08)",
            padding: "6px 12px",
            borderRadius: 8,
            border: "1px solid rgba(34,197,94,0.15)",
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#22c55e",
              boxShadow: "0 0 8px #22c55e",
              animation: "pulse 2s ease-in-out infinite",
            }}
          />
          <span style={{ color: "#22c55e", fontSize: 12, fontWeight: 500 }}>
            System Active
          </span>
        </div>

        {/* Notifications */}
        <div ref={notifRef} style={{ position: "relative" }}>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: showNotifs
                ? "rgba(59,130,246,0.15)"
                : "rgba(255,255,255,0.04)",
              border: showNotifs
                ? "1px solid rgba(59,130,246,0.3)"
                : "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              position: "relative",
              transition: "all 0.2s",
            }}
          >
            <Bell
              size={18}
              style={{ color: showNotifs ? "#60a5fa" : "#94a3b8" }}
            />
            {notifications.length > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #ef4444, #dc2626)",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(239,68,68,0.4)",
                }}
              >
                {notifications.length}
              </motion.span>
            )}
          </button>

          <AnimatePresence>
            {showNotifs && (
              <>
                {/* Backdrop for mobile */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.3)",
                    zIndex: 9998,
                  }}
                  onClick={() => setShowNotifs(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ type: "spring", damping: 25, stiffness: 400 }}
                  style={{
                    position: "fixed",
                    right: 24,
                    top: 76,
                    width: 360,
                    background:
                      "linear-gradient(180deg, rgba(15,22,41,0.99) 0%, rgba(10,14,26,0.99) 100%)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 20,
                    boxShadow:
                      "0 25px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05) inset",
                    zIndex: 9999,
                    overflow: "hidden",
                  }}
                >
                  {/* Header */}
                  <div
                    style={{
                      padding: "16px 20px",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: "rgba(255,255,255,0.02)",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: "#ef4444",
                          animation: "pulse 2s infinite",
                        }}
                      />
                      <span
                        style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}
                      >
                        Alerts
                      </span>
                      <span
                        style={{
                          color: "#f87171",
                          fontSize: 11,
                          background: "rgba(239,68,68,0.15)",
                          padding: "2px 8px",
                          borderRadius: 10,
                          fontWeight: 600,
                        }}
                      >
                        {notifications.length} new
                      </span>
                    </div>
                    <button
                      onClick={() => setNotifications([])}
                      style={{
                        color: "#64748b",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 8,
                        padding: "4px 10px",
                        cursor: "pointer",
                        fontSize: 11,
                        fontWeight: 500,
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.background = "rgba(255,255,255,0.1)")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.background = "rgba(255,255,255,0.05)")
                      }
                    >
                      Clear all
                    </button>
                  </div>

                  {/* Notifications list */}
                  <div style={{ maxHeight: 340, overflowY: "auto" }}>
                    {notifications.length === 0 ? (
                      <div
                        style={{ padding: "40px 20px", textAlign: "center" }}
                      >
                        <Bell
                          size={32}
                          style={{ color: "#334155", marginBottom: 12 }}
                        />
                        <p style={{ color: "#64748b", fontSize: 14 }}>
                          No new alerts
                        </p>
                        <p
                          style={{
                            color: "#475569",
                            fontSize: 12,
                            marginTop: 4,
                          }}
                        >
                          You're all caught up!
                        </p>
                      </div>
                    ) : (
                      notifications.map((n, idx) => (
                        <motion.div
                          key={n.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          style={{
                            padding: "14px 20px",
                            borderBottom: "1px solid rgba(255,255,255,0.04)",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 12,
                            cursor: "pointer",
                            transition: "all 0.15s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "rgba(255,255,255,0.03)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                        >
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 10,
                              background: "rgba(239,68,68,0.12)",
                              border: "1px solid rgba(239,68,68,0.2)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <AlertTriangle
                              size={16}
                              style={{ color: "#f87171" }}
                            />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                marginBottom: 4,
                              }}
                            >
                              <p
                                style={{
                                  color: "#fff",
                                  fontSize: 13,
                                  fontWeight: 600,
                                }}
                              >
                                {n.name}
                              </p>
                              <span
                                style={{
                                  color: "#f87171",
                                  fontSize: 12,
                                  fontWeight: 700,
                                  background: "rgba(239,68,68,0.1)",
                                  padding: "2px 6px",
                                  borderRadius: 6,
                                }}
                              >
                                {n.risk}%
                              </span>
                            </div>
                            <p
                              style={{
                                color: "#94a3b8",
                                fontSize: 12,
                                textTransform: "capitalize",
                              }}
                            >
                              {n.type.replace(/_/g, " ")}
                            </p>
                            <p
                              style={{
                                color: "#475569",
                                fontSize: 11,
                                marginTop: 4,
                              }}
                            >
                              {n.time}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(n.id);
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#475569",
                              cursor: "pointer",
                              padding: 4,
                              borderRadius: 6,
                              transition: "all 0.15s",
                            }}
                            onMouseEnter={(e) =>
                              (e.target.style.color = "#f87171")
                            }
                            onMouseLeave={(e) =>
                              (e.target.style.color = "#475569")
                            }
                          >
                            <X size={14} />
                          </button>
                        </motion.div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div
                      style={{
                        padding: "12px 20px",
                        borderTop: "1px solid rgba(255,255,255,0.06)",
                        background: "rgba(255,255,255,0.02)",
                      }}
                    >
                      <button
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: 10,
                          background: "rgba(59,130,246,0.1)",
                          border: "1px solid rgba(59,130,246,0.2)",
                          color: "#60a5fa",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.background = "rgba(59,130,246,0.2)")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.background = "rgba(59,130,246,0.1)")
                        }
                      >
                        View all alerts →
                      </button>
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* User avatar */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 700,
            color: "#fff",
            cursor: "pointer",
            border: "2px solid rgba(255,255,255,0.1)",
            boxShadow: "0 4px 12px rgba(59,130,246,0.3)",
          }}
          title={user?.name}
        >
          {user?.name?.charAt(0) || "A"}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
      `}</style>
    </header>
  );
}
