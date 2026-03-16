import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Search, Filter, X, Download, RefreshCw } from "lucide-react";
import ActivityTable from "../components/ActivityTable";
import api from "../services/api";

export default function Activities() {
  const [activities, setActivities] = useState([]);
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("all");
  const [anomalyOnly, setAnomaly] = useState(false);

  const [backendError, setBackendError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActivities = () => {
    setBackendError(null);
    setRefreshing(true);
    api
      .get("/api/activities?limit=100")
      .then(({ data }) => {
        if (data.success && data.data)
          setActivities(Array.isArray(data.data) ? data.data : []);
      })
      .catch((err) => {
        setBackendError(
          err.response?.status === 401
            ? "Log in to see live activity data."
            : "Start the backend and MongoDB to see live data.",
        );
      })
      .finally(() => setRefreshing(false));
  };

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 10000);
    return () => clearInterval(interval);
  }, []);

  const filtered = activities.filter((a) => {
    if (anomalyOnly && !a.isAnomaly) return false;
    if (action !== "all" && a.actionType !== action) return false;
    if (search && !a.employeeName.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const totalAnomalies = activities.filter((a) => a.isAnomaly).length;
  const avgRisk = activities.length
    ? Math.round(
        activities.reduce((s, a) => s + (a.riskScore || 0), 0) /
          activities.length,
      )
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ display: "flex", flexDirection: "column", gap: 24 }}
    >
      {backendError && (
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
          {backendError}
        </div>
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 700 }}>
            Activity Logs
          </h1>
          <p style={{ color: "#64748b", fontSize: 14 }}>
            Monitor all privileged user actions. Edited in MongoDB? Click
            Refresh to see changes.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={fetchActivities}
            disabled={refreshing}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 16px",
              borderRadius: 10,
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
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 16px",
              borderRadius: 10,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#94a3b8",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
        }}
      >
        {[
          { label: "Total Logged", value: activities.length, color: "#60a5fa" },
          {
            label: "Anomalies Detected",
            value: totalAnomalies,
            color: "#f87171",
          },
          { label: "Avg Risk Score", value: avgRisk, color: "#facc15" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="glass-card"
            style={{ padding: 20, textAlign: "center" }}
          >
            <p style={{ color: "#64748b", fontSize: 12 }}>{label}</p>
            <p style={{ color, fontSize: 32, fontWeight: 700, marginTop: 6 }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: 20 }}>
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#64748b",
              }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10,
                padding: "10px 16px 10px 36px",
                color: "#fff",
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <button
            onClick={() => setAnomaly(!anomalyOnly)}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: anomalyOnly
                ? "1px solid rgba(239,68,68,0.4)"
                : "1px solid rgba(255,255,255,0.08)",
              background: anomalyOnly
                ? "rgba(239,68,68,0.15)"
                : "rgba(255,255,255,0.04)",
              color: anomalyOnly ? "#f87171" : "#94a3b8",
              fontSize: 13,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Filter size={14} /> Anomalies Only
          </button>
          {(search || anomalyOnly) && (
            <button
              onClick={() => {
                setSearch("");
                setAnomaly(false);
              }}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#94a3b8",
                fontSize: 13,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>
        <p style={{ color: "#64748b", fontSize: 12, marginTop: 10 }}>
          Showing {filtered.length} of {activities.length} events
        </p>
      </div>

      <div className="glass-card" style={{ padding: 24 }}>
        <ActivityTable activities={filtered} />
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
}
