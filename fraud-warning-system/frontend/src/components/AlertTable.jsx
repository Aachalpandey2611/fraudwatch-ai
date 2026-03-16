import { motion } from "framer-motion";
import { AlertTriangle, Clock, ChevronRight } from "lucide-react";
const sev = { critical: { label: "Critical", cls: "badge-critical", bar: "#ef4444" }, high: { label: "High", cls: "badge-high", bar: "#f97316" }, medium: { label: "Medium", cls: "badge-medium", bar: "#eab308" }, low: { label: "Low", cls: "badge-low", bar: "#22c55e" } };
export default function AlertTable({ alerts = [], onAlertClick }) {
  if (!alerts.length) return <div style={{ textAlign: "center", padding: "80px 0", color: "#64748b" }}><AlertTriangle size={48} style={{ margin: "0 auto 12px", opacity: 0.3 }} /><p>No alerts found</p></div>;
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="data-table"><thead><tr>{["Employee", "Department", "Risk", "Activity", "Severity", "Status", "Time", ""].map(h => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>{alerts.map((a, i) => {
          const s = sev[a.severity] || sev.medium;
          return (
            <motion.tr key={a._id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} onClick={() => onAlertClick?.(a)} style={{ cursor: "pointer" }}>
              <td><div style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, rgba(59,130,246,0.3), rgba(139,92,246,0.3))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#93c5fd" }}>{a.employeeName?.charAt(0)}</div><div><p style={{ color: "#fff", fontSize: 13, fontWeight: 500 }}>{a.employeeName}</p><p style={{ color: "#64748b", fontSize: 11 }}>{a.employeeId}</p></div></div></td>
              <td style={{ color: "#94a3b8", fontSize: 13 }}>{a.department}</td>
              <td><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 60, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}><div style={{ height: "100%", width: a.riskScore + "%", background: s.bar, borderRadius: 3 }} /></div><span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{a.riskScore}%</span></div></td>
              <td style={{ color: "#cbd5e1", fontSize: 13, textTransform: "capitalize" }}>{a.activityType?.replace(/_/g, " ")}</td>
              <td><span className={s.cls}>{s.label}</span></td>
              <td style={{ color: a.status === "open" ? "#f87171" : a.status === "resolved" ? "#4ade80" : "#facc15", fontSize: 13, textTransform: "capitalize" }}>{a.status?.replace("_", " ")}</td>
              <td><div style={{ display: "flex", alignItems: "center", gap: 4, color: "#64748b", fontSize: 11 }}><Clock size={11} />{new Date(a.timestamp).toLocaleString()}</div></td>
              <td><ChevronRight size={16} style={{ color: "#475569" }} /></td>
            </motion.tr>
          );
        })}</tbody>
      </table>
    </div>
  );
}
