import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Shield, AlertTriangle } from "lucide-react";
import ExplainabilityPanel from "../components/ExplainabilityPanel";
import PDFReportGenerator from "../components/PDFReportGenerator";
import api from "../services/api";

const INVESTIGATORS = ["Sarah Chen", "James Wilson", "Maria Santos", "Derek Hughes", "Amy Zhang", "Michael Park"];

const statusConfig = {
  open:           { label: "Open",           color: "#f87171", bg: "rgba(239,68,68,0.1)"    },
  investigating:  { label: "Investigating",  color: "#facc15", bg: "rgba(234,179,8,0.1)"    },
  resolved:       { label: "Resolved",       color: "#4ade80", bg: "rgba(34,197,94,0.1)"    },
  false_positive: { label: "False Positive", color: "#94a3b8", bg: "rgba(100,116,139,0.1)"  },
};

export default function Investigation() {
  const [cases, setCases] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilter] = useState("all");
  const [backendError, setBackendError] = useState(null);

  useEffect(() => {
    setBackendError(null);
    api.get("/api/alerts?limit=100")
      .then(({ data }) => {
        if (data.success && data.data) {
          setCases((Array.isArray(data.data) ? data.data : []).map(a => ({ ...a, notes: a.notes || "" })));
        }
      })
      .catch(() => {
        setBackendError("Unable to load cases. Ensure backend and MongoDB are running.");
      });
  }, []);

  const filtered = cases.filter(c => {
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    if (search && !c.employeeName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const updateCase = async (id, updates) => {
    // Optimistic update
    setCases(prev => prev.map(c => c._id === id ? { ...c, ...updates } : c));
    if (selected?._id === id) setSelected(prev => ({ ...prev, ...updates }));
    // Persist to backend
    try { await api.put(`/api/alerts/${id}`, updates); } catch {}
  };

  const totals = {
    open:          cases.filter(c => c.status === "open").length,
    investigating: cases.filter(c => c.status === "investigating").length,
    resolved:      cases.filter(c => c.status === "resolved").length,
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {backendError && (
        <div style={{ background: "rgba(251, 191, 36, 0.12)", border: "1px solid rgba(251, 191, 36, 0.4)", borderRadius: 12, padding: "12px 16px", color: "#fbbf24", fontSize: 13 }}>
          {backendError}
        </div>
      )}
      <div>
        <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 700 }}>Case Investigation</h1>
        <p style={{ color: "#64748b", fontSize: 14 }}>Manage and investigate fraud cases</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {Object.entries(totals).map(([status, count]) => {
          const s = statusConfig[status];
          return (
            <div key={status} className="glass-card" onClick={() => setFilter(filterStatus === status ? "all" : status)} style={{ padding: 20, cursor: "pointer" }}>
              <p style={{ color: "#64748b", fontSize: 12, textTransform: "capitalize" }}>{status}</p>
              <p style={{ color: s.color, fontSize: 32, fontWeight: 700 }}>{count}</p>
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 20 }}>
        {/* Case List */}
        <div>
          <div style={{ position: "relative", marginBottom: 12 }}>
            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cases..." style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 16px 10px 36px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map(c => {
              const s = statusConfig[c.status] || statusConfig.open;
              const isSelected = selected?._id === c._id;
              return (
                <div key={c._id} onClick={() => setSelected(c)} style={{ padding: 16, borderRadius: 12, background: isSelected ? "rgba(59,130,246,0.1)" : "rgba(255,255,255,0.03)", border: isSelected ? "1px solid rgba(59,130,246,0.3)" : "1px solid transparent", cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <div>
                      <p style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>{c.employeeName}</p>
                      <p style={{ color: "#64748b", fontSize: 11 }}>{c.alertId}</p>
                    </div>
                    <span style={{ fontSize: 10, color: s.color, background: s.bg, padding: "2px 8px", borderRadius: 10, height: "fit-content" }}>{s.label}</span>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 14, color: c.riskScore >= 75 ? "#f87171" : "#facc15" }}>{c.riskScore}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Case Detail */}
        <div className="glass-card" style={{ padding: 24 }}>
          {!selected ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, color: "#64748b" }}>
              <Shield size={64} style={{ opacity: 0.2 }} />
              <p style={{ fontSize: 16, fontWeight: 500, marginTop: 12 }}>Select a case to investigate</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}>{selected.employeeName}</h2>
                <p style={{ color: "#64748b", fontSize: 13 }}>{selected.alertId} — {selected.department}</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                <div style={{ padding: 16, borderRadius: 12, background: "rgba(239,68,68,0.08)", textAlign: "center" }}>
                  <p style={{ color: "#64748b", fontSize: 11 }}>Risk Score</p>
                  <p style={{ color: "#f87171", fontSize: 28, fontWeight: 700 }}>{selected.riskScore}%</p>
                </div>
                <div style={{ padding: 16, borderRadius: 12, background: "rgba(255,255,255,0.04)", textAlign: "center" }}>
                  <p style={{ color: "#64748b", fontSize: 11 }}>Severity</p>
                  <p style={{ color: "#fff", fontSize: 18, fontWeight: 700, textTransform: "capitalize" }}>{selected.severity}</p>
                </div>
                <div style={{ padding: 16, borderRadius: 12, background: "rgba(255,255,255,0.04)", textAlign: "center" }}>
                  <p style={{ color: "#64748b", fontSize: 11 }}>Status</p>
                  <select value={selected.status} onChange={e => updateCase(selected._id, { status: e.target.value })} style={{ background: "transparent", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", outline: "none", textTransform: "capitalize", marginTop: 4 }}>
                    {["open", "investigating", "resolved", "false_positive"].map(s => <option key={s} value={s} style={{ background: "#1a2540" }}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <h3 style={{ color: "#fff", fontWeight: 600, fontSize: 14, marginBottom: 12 }}>AI Risk Factors</h3>
                {(selected.reasons || []).map((r, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "rgba(239,68,68,0.06)", borderRadius: 8, marginBottom: 8 }}>
                    <AlertTriangle size={12} style={{ color: "#f87171" }} />
                    <span style={{ color: "#fca5a5", fontSize: 13 }}>{r}</span>
                  </div>
                ))}
                <ExplainabilityPanel alert={selected} compact={true} />
              </div>

              <div>
                <h3 style={{ color: "#fff", fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Investigation Notes</h3>
                <textarea
                  value={selected.notes}
                  onChange={e => updateCase(selected._id, { notes: e.target.value })}
                  placeholder="Add investigation notes..."
                  rows={4}
                  style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "12px 16px", color: "#fff", fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }}
                />
              </div>

              <div>
                <h3 style={{ color: "#fff", fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Export Report</h3>
                <PDFReportGenerator alert={selected} notes={selected.notes} />
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
