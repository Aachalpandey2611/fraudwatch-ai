import { motion } from "framer-motion";
import { Activity, Clock, Database, MapPin } from "lucide-react";
export default function ActivityTable({ activities = [] }) {
  if (!activities.length) return <div style={{ textAlign: "center", padding: "80px 0", color: "#64748b" }}><Activity size={48} style={{ margin: "0 auto 12px", opacity: 0.3 }} /><p>No activities found</p></div>;
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="data-table"><thead><tr>{["Employee", "Action", "System", "Volume", "Location", "Risk", "Time"].map(h => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>{activities.map((a, i) => {
          const rc = a.riskScore >= 75 ? "#f87171" : a.riskScore >= 40 ? "#facc15" : "#4ade80";
          return (
            <motion.tr key={a._id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} style={{ background: a.isAnomaly ? "rgba(239,68,68,0.03)" : "transparent" }}>
              <td><p style={{ color: "#fff", fontSize: 13, fontWeight: 500 }}>{a.employeeName}</p><p style={{ color: "#64748b", fontSize: 11 }}>{a.department}</p></td>
              <td style={{ color: "#94a3b8", fontSize: 13, textTransform: "capitalize" }}>{a.actionType?.replace(/_/g, " ")}</td>
              <td><div style={{ display: "flex", alignItems: "center", gap: 6, color: "#94a3b8", fontSize: 13 }}><Database size={12} />{a.systemAccessed}</div></td>
              <td style={{ color: "#94a3b8", fontSize: 13 }}>{a.dataVolume}MB</td>
              <td><div style={{ display: "flex", alignItems: "center", gap: 6, color: "#94a3b8", fontSize: 12 }}><MapPin size={11} />{a.location}</div></td>
              <td><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: rc }} /><span style={{ color: rc, fontWeight: 700, fontSize: 13 }}>{a.riskScore}</span>{a.isAnomaly && <span style={{ fontSize: 10, color: "#f87171", background: "rgba(239,68,68,0.1)", padding: "1px 6px", borderRadius: 4 }}>ANOMALY</span>}</div></td>
              <td><div style={{ display: "flex", alignItems: "center", gap: 4, color: "#64748b", fontSize: 11 }}><Clock size={11} />{new Date(a.timestamp).toLocaleString()}</div></td>
            </motion.tr>
          );
        })}</tbody>
      </table>
    </div>
  );
}
