import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Users,
  AlertTriangle,
  ShieldAlert,
  Activity,
  RefreshCw,
  User,
} from "lucide-react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import StatCard from "../components/StatCard";
import {
  RiskDistributionChart,
  DepartmentChart,
} from "../components/RiskChart";
import FraudGraph from "../components/FraudGraph";
import LiveDemoMode from "../components/LiveDemoMode";
import api from "../services/api";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? "https://fraudwatch-backend.onrender.com"
    : "http://localhost:4000");

const EMPTY_STATS = {
  totalEmployees: 0,
  totalAlerts: 0,
  highRiskUsers: 0,
  anomaliesToday: 0,
};

const playFraudTone = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(980, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(620, ctx.currentTime + 0.22);

    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.1, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
    osc.onended = () => {
      ctx.close().catch(() => {});
    };
  } catch {
    // Ignore audio errors (autoplay and browser policy constraints).
  }
};

export default function Dashboard() {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [deptStats, setDeptStats] = useState([]);
  const [riskDist, setRiskDist] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [usingLive, setUsingLive] = useState(false);

  const [backendError, setBackendError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const highRiskEmployees = useMemo(() => {
    const byName = new Map();
    alerts.forEach((alert) => {
      const risk = Number(alert?.riskScore || 0);
      if (risk < 75) return;
      const name = String(alert?.employeeName || "Unknown Employee");
      const current = byName.get(name);
      if (!current || risk > current.riskScore) {
        byName.set(name, {
          employeeName: name,
          department: alert?.department || "Unknown",
          riskScore: risk,
          timestamp: alert?.timestamp,
        });
      }
    });

    return Array.from(byName.values())
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 8);
  }, [alerts]);

  const fetchDashboardData = useCallback(async (silent = false) => {
    setBackendError(null);
    if (!silent) setRefreshing(true);
    try {
      const [activitiesRes, alertsRes, statsRes] = await Promise.allSettled([
        api.get("/api/activities?limit=200"),
        api.get("/api/alerts?limit=200"),
        api.get("/api/activities/stats"),
      ]);
      let successCount = 0;

      if (activitiesRes.status === "fulfilled") {
        const activitiesData = Array.isArray(activitiesRes.value?.data?.data)
          ? activitiesRes.value.data.data
          : [];
        setActivities(activitiesData);
        successCount += 1;
      }

      if (alertsRes.status === "fulfilled") {
        const alertsData = Array.isArray(alertsRes.value?.data?.data)
          ? alertsRes.value.data.data
          : [];
        setAlerts(alertsData);
        successCount += 1;
      }

      if (statsRes.status === "fulfilled") {
        const statsData = statsRes.value?.data || {};
        if (statsData.success) {
          setStats(statsData.stats || EMPTY_STATS);
          setDeptStats(
            Array.isArray(statsData.departmentStats)
              ? statsData.departmentStats
              : [],
          );
          setRiskDist(
            Array.isArray(statsData.riskDistribution)
              ? statsData.riskDistribution
              : [],
          );
        }
        successCount += 1;
      }

      if (successCount > 0) {
        setUsingLive(true);
        setBackendError(null);
      } else {
        throw statsRes.reason || alertsRes.reason || activitiesRes.reason;
      }
    } catch (err) {
      setUsingLive(false);
      const status = err.response?.status;
      const isTimeout = err.code === "ECONNABORTED";
      const msg =
        status === 401
          ? "Session expired. Please log in again to load live dashboard data."
          : isTimeout
            ? "Live data request timed out. Click Refresh data again."
            : "Unable to fetch live data right now. Backend or MongoDB may be temporarily unavailable.";
      setBackendError(msg);
    } finally {
      if (!silent) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => fetchDashboardData(true), 10000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["polling", "websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1500,
      timeout: 8000,
    });

    socket.on("connect_error", () => {
      // Keep dashboard usable via REST polling even if real-time channel is down.
    });

    socket.on("new_alert", ({ alert }) => {
      playFraudTone();
      toast.error(
        `Alert: ${alert?.employeeName || "Unknown"} • Risk ${alert?.riskScore || "N/A"}`,
      );
      if (alert) {
        setAlerts((prev) => [alert, ...prev]);
      }
      fetchDashboardData(true);
    });

    socket.on("alert_updated", () => {
      fetchDashboardData(true);
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchDashboardData]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ display: "flex", flexDirection: "column", gap: 24 }}
    >
      {/* Demo mode / connection notice */}
      {!usingLive && backendError && (
        <div
          style={{
            background: "rgba(251, 191, 36, 0.12)",
            border: "1px solid rgba(251, 191, 36, 0.4)",
            borderRadius: 12,
            padding: "12px 16px",
            color: "#fbbf24",
            fontSize: 13,
          }}
        >
          Log in and ensure the backend and MongoDB are running to see data.{" "}
          {backendError}
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 700 }}>
            Security Dashboard
          </h1>
          <p style={{ color: "#64748b", fontSize: 14 }}>
            {usingLive
              ? "Live data from MongoDB"
              : "Start backend and log in for live data"}
          </p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <LiveDemoMode />
          <button
            onClick={() => fetchDashboardData()}
            disabled={refreshing}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "11px 20px",
              borderRadius: 12,
              border: "1px solid rgba(96, 165, 250, 0.4)",
              background: "rgba(96, 165, 250, 0.12)",
              color: "#60a5fa",
              fontSize: 13,
              fontWeight: 600,
              cursor: refreshing ? "wait" : "pointer",
            }}
          >
            <RefreshCw
              size={14}
              style={{
                animation: refreshing ? "spin 1s linear infinite" : "none",
              }}
            />
            {refreshing ? "Refreshing..." : "Refresh data"}
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
        }}
      >
        <StatCard
          title="Employees Monitored"
          value={stats.totalEmployees}
          icon={Users}
          color="blue"
          change={2}
          delay={0}
        />
        <StatCard
          title="Total Alerts"
          value={stats.totalAlerts}
          icon={AlertTriangle}
          color="red"
          change={12}
          delay={0.1}
        />
        <StatCard
          title="High Risk Users"
          value={stats.highRiskUsers}
          icon={ShieldAlert}
          color="orange"
          change={5}
          delay={0.2}
        />
        <StatCard
          title="Anomalies Today"
          value={stats.anomaliesToday}
          icon={Activity}
          color="purple"
          change={-8}
          delay={0.3}
        />
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <RiskDistributionChart data={riskDist} />
        <DepartmentChart data={deptStats} />
      </div>

      {/* High Risk + Graph Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20 }}>
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ color: "#fff", fontWeight: 600, marginBottom: 4 }}>
            High Risk Employees
          </h3>
          <p style={{ color: "#64748b", fontSize: 13, marginBottom: 16 }}>
            Employees currently flagged at high risk
          </p>
          {!highRiskEmployees.length ? (
            <div
              style={{
                textAlign: "center",
                color: "#64748b",
                fontSize: 13,
                padding: "28px 10px",
                border: "1px dashed rgba(255,255,255,0.1)",
                borderRadius: 12,
                background: "rgba(255,255,255,0.02)",
              }}
            >
              No high-risk employees right now
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {highRiskEmployees.map((item, index) => (
                <div
                  key={`${item.employeeName}-${index}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "24px 1fr auto",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid rgba(248,113,113,0.2)",
                    background: "rgba(248,113,113,0.07)",
                  }}
                >
                  <User size={14} style={{ color: "#f87171" }} />
                  <div>
                    <p style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>
                      {item.employeeName}
                    </p>
                    <p style={{ color: "#94a3b8", fontSize: 11 }}>
                      {item.department}
                    </p>
                  </div>
                  <div
                    style={{ color: "#f87171", fontWeight: 700, fontSize: 12 }}
                  >
                    {item.riskScore}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <FraudGraph />
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
}
