import { AlertTriangle, Download, Lock, User, Clock, Activity } from "lucide-react";
const iconMap = { bulk_download: Download, privilege_escalation: Lock, account_modification: User, default: Activity };
function timeAgo(ts) { const m = Math.floor((Date.now() - new Date(ts).getTime()) / 60000); return m < 60 ? m + "m ago" : Math.floor(m/60) + "h ago"; }
export default function Timeline({ events = [] }) {
  const items = Array.isArray(events) ? events : [];
  if (items.length === 0) {
    return (
      <div style={{ padding: "24px 0", color: "#64748b", fontSize: 13, textAlign: "center" }}>
        No recent anomalies
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {items.slice(0, 5).map((e, i) => {
        const Icon = iconMap[e.actionType] || iconMap.default;
        const rc = e.riskScore >= 75 ? "#f87171" : e.riskScore >= 50 ? "#facc15" : "#4ade80";
        return (
          <div key={i} style={{ display: "flex", gap: 12, position: "relative", paddingBottom: 16 }}>
            {i < items.length - 1 && <div style={{ position: "absolute", left: 15, top: 32, bottom: 0, width: 2, background: "rgba(255,255,255,0.06)" }} />}
            <div style={{ width: 32, height: 32, borderRadius: 8, background: rc + "20", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, zIndex: 1 }}><Icon size={14} style={{ color: rc }} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><p style={{ color: "#fff", fontSize: 13, fontWeight: 500 }}>{e.employeeName}</p><span style={{ color: rc, fontSize: 12, fontWeight: 700 }}>{e.riskScore}%</span></div>
              <p style={{ color: "#64748b", fontSize: 11, textTransform: "capitalize" }}>{e.actionType?.replace(/_/g, " ")}</p>
              <p style={{ color: "#475569", fontSize: 10, display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}><Clock size={10} />{timeAgo(e.timestamp)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
