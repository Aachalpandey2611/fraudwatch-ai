import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

const colors = {
  blue:   { bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.2)",  icon: "#60a5fa" },
  red:    { bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.2)",   icon: "#f87171" },
  orange: { bg: "rgba(249,115,22,0.1)",  border: "rgba(249,115,22,0.2)",  icon: "#fb923c" },
  green:  { bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.2)",   icon: "#4ade80" },
  purple: { bg: "rgba(139,92,246,0.1)",  border: "rgba(139,92,246,0.2)",  icon: "#a78bfa" },
};

export default function StatCard({ title, value, icon: Icon, color, change, suffix = "", delay = 0 }) {
  const c = colors[color] || colors.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass-card"
      style={{ padding: 24, border: `1px solid ${c.border}` }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ color: "#94a3b8", fontSize: 13, fontWeight: 500 }}>{title}</p>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginTop: 8 }}>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.2 }}
              style={{ fontSize: 32, fontWeight: 700, color: "#fff" }}
            >
              {value}
            </motion.span>
            {suffix && <span style={{ color: "#94a3b8", fontSize: 13, marginBottom: 4 }}>{suffix}</span>}
          </div>
          {change !== undefined && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8, color: change >= 0 ? "#f87171" : "#4ade80", fontSize: 11 }}>
              {change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{Math.abs(change)}% vs yesterday</span>
            </div>
          )}
        </div>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: c.bg, border: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={24} style={{ color: c.icon }} />
        </div>
      </div>
    </motion.div>
  );
}
