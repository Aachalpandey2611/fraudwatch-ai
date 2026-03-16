import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Search } from "lucide-react";
import AlertTable from "../components/AlertTable";
import ExplainabilityPanel from "../components/ExplainabilityPanel";
import PDFReportGenerator from "../components/PDFReportGenerator";
import api from "../services/api";

const sevColor = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#22c55e",
};

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [backendError, setBackendError] = useState(null);
  const [severity, setSeverity] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const fetchAlerts = () => {
    setBackendError(null);
    api
      .get("/api/alerts?limit=100")
      .then(({ data }) => {
        if (data.success && data.data)
          setAlerts(Array.isArray(data.data) ? data.data : []);
      })
      .catch(() => {
        setBackendError(
          "Unable to load alerts. Ensure backend and MongoDB are running.",
        );
      });
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  const filtered = alerts.filter((a) => {
    if (severity !== "all" && a.severity !== severity) return false;
    if (status !== "all" && a.status !== status) return false;
    if (search && !a.employeeName.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const counts = {
    critical: alerts.filter((a) => a.severity === "critical").length,
    high: alerts.filter((a) => a.severity === "high").length,
    medium: alerts.filter((a) => a.severity === "medium").length,
    low: alerts.filter((a) => a.severity === "low").length,
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await api.put(`/api/alerts/${id}`, { status: newStatus });
    } catch {}
    setAlerts((prev) =>
      prev.map((a) => (a._id === id ? { ...a, status: newStatus } : a)),
    );
    if (selected?._id === id)
      setSelected((prev) => ({ ...prev, status: newStatus }));
  };

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
      <div>
        <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 700 }}>
          Fraud Alerts
        </h1>
        <p style={{ color: "#64748b", fontSize: 14 }}>
          Real-time monitoring of suspicious activities
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
        }}
      >
        {Object.entries(counts).map(([sev, count]) => (
          <button
            key={sev}
            onClick={() => setSeverity(severity === sev ? "all" : sev)}
            style={{
              padding: 16,
              borderRadius: 14,
              border:
                severity === sev
                  ? "1px solid " + sevColor[sev] + "60"
                  : "1px solid rgba(255,255,255,0.06)",
              background:
                severity === sev
                  ? sevColor[sev] + "15"
                  : "rgba(255,255,255,0.03)",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: sevColor[sev],
                }}
              />
              <span
                style={{
                  color: "#94a3b8",
                  fontSize: 12,
                  textTransform: "capitalize",
                }}
              >
                {sev}
              </span>
            </div>
            <p
              style={{
                color: sevColor[sev],
                fontSize: 28,
                fontWeight: 700,
                marginTop: 6,
              }}
            >
              {count}
            </p>
          </button>
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
              placeholder="Search by name..."
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
          {["all", "open", "investigating", "resolved"].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                border:
                  status === s
                    ? "1px solid rgba(59,130,246,0.4)"
                    : "1px solid rgba(255,255,255,0.08)",
                background:
                  status === s
                    ? "rgba(59,130,246,0.15)"
                    : "rgba(255,255,255,0.04)",
                color: status === s ? "#60a5fa" : "#64748b",
                fontSize: 12,
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {s === "all" ? "All Status" : s}
            </button>
          ))}
        </div>
        <p style={{ color: "#64748b", fontSize: 12, marginTop: 12 }}>
          Showing {filtered.length} of {alerts.length} alerts
        </p>
      </div>

      <div className="glass-card" style={{ padding: 24 }}>
        <AlertTable alerts={filtered} onAlertClick={setSelected} />
      </div>

      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              style={{
                position: "fixed",
                inset: 0,
                background: "#000",
                zIndex: 40,
              }}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              style={{
                position: "fixed",
                right: 0,
                top: 0,
                bottom: 0,
                width: 520,
                background: "rgba(10,14,26,0.98)",
                borderLeft: "1px solid rgba(255,255,255,0.08)",
                zIndex: 50,
                overflowY: "auto",
                padding: 24,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 24,
                }}
              >
                <h2 style={{ color: "#fff", fontWeight: 700 }}>
                  Alert Details
                </h2>
                <button
                  onClick={() => setSelected(null)}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "none",
                    borderRadius: 8,
                    width: 32,
                    height: 32,
                    cursor: "pointer",
                    color: "#94a3b8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <X size={16} />
                </button>
              </div>
              <div
                className="glass-card"
                style={{ padding: 20, marginBottom: 16 }}
              >
                <p style={{ color: "#fff", fontWeight: 600, fontSize: 16 }}>
                  {selected.employeeName}
                </p>
                <p style={{ color: "#64748b", fontSize: 13 }}>
                  {selected.employeeId} • {selected.department}
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                    marginTop: 16,
                  }}
                >
                  <div
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: 10,
                      padding: 12,
                    }}
                  >
                    <p style={{ color: "#64748b", fontSize: 11 }}>Risk Score</p>
                    <p
                      style={{
                        color: "#f87171",
                        fontSize: 24,
                        fontWeight: 700,
                      }}
                    >
                      {selected.riskScore}%
                    </p>
                  </div>
                  <div
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: 10,
                      padding: 12,
                    }}
                  >
                    <p style={{ color: "#64748b", fontSize: 11 }}>Status</p>
                    <select
                      value={selected.status}
                      onChange={(e) =>
                        updateStatus(selected._id, e.target.value)
                      }
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#fff",
                        fontSize: 14,
                        fontWeight: 500,
                        cursor: "pointer",
                        outline: "none",
                        textTransform: "capitalize",
                      }}
                    >
                      {[
                        "open",
                        "investigating",
                        "resolved",
                        "false_positive",
                      ].map((s) => (
                        <option
                          key={s}
                          value={s}
                          style={{ background: "#1a2540" }}
                        >
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div
                className="glass-card"
                style={{ padding: 20, marginBottom: 16 }}
              >
                <h3
                  style={{
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: 14,
                    marginBottom: 12,
                  }}
                >
                  Flagged Activities
                </h3>
                {(selected.reasons || []).map((r, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 12px",
                      background: "rgba(239,68,68,0.06)",
                      borderRadius: 8,
                      marginBottom: 8,
                    }}
                  >
                    <AlertTriangle
                      size={12}
                      style={{ color: "#f87171", flexShrink: 0 }}
                    />
                    <span style={{ color: "#fca5a5", fontSize: 13 }}>{r}</span>
                  </div>
                ))}
              </div>
              <ExplainabilityPanel alert={selected} compact={true} />
              <div style={{ marginTop: 20 }}>
                <h3
                  style={{
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: 14,
                    marginBottom: 12,
                  }}
                >
                  Export Report
                </h3>
                <PDFReportGenerator alert={selected} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
