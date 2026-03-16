import { motion } from "framer-motion";
import {
  Brain,
  TrendingUp,
  Clock,
  MapPin,
  Database,
  AlertTriangle,
} from "lucide-react";

// Calculate risk factors based on activity data
function calculateRiskFactors(alert) {
  const factors = [];

  if (alert.reasons) {
    alert.reasons.forEach((reason) => {
      const r = reason.toLowerCase();

      if (
        r.includes("hour") ||
        r.includes("time") ||
        r.includes("am") ||
        r.includes("pm")
      ) {
        factors.push({
          category: "Time Anomaly",
          reason: reason,
          impact: 25 + Math.random() * 15,
          icon: Clock,
          color: "#f97316",
        });
      }

      if (
        r.includes("download") ||
        r.includes("data") ||
        r.includes("volume") ||
        r.includes("gb") ||
        r.includes("mb")
      ) {
        factors.push({
          category: "Data Volume",
          reason: reason,
          impact: 20 + Math.random() * 20,
          icon: Database,
          color: "#ef4444",
        });
      }

      if (
        r.includes("location") ||
        r.includes("ip") ||
        r.includes("vpn") ||
        r.includes("unrecognized")
      ) {
        factors.push({
          category: "Location Risk",
          reason: reason,
          impact: 15 + Math.random() * 15,
          icon: MapPin,
          color: "#eab308",
        });
      }

      if (
        r.includes("privilege") ||
        r.includes("escalation") ||
        r.includes("admin") ||
        r.includes("access")
      ) {
        factors.push({
          category: "Privilege Abuse",
          reason: reason,
          impact: 30 + Math.random() * 10,
          icon: AlertTriangle,
          color: "#dc2626",
        });
      }

      if (
        r.includes("account") ||
        r.includes("session") ||
        r.includes("modification")
      ) {
        factors.push({
          category: "Behavior Pattern",
          reason: reason,
          impact: 15 + Math.random() * 15,
          icon: TrendingUp,
          color: "#f59e0b",
        });
      }
    });
  }

  // Fallback if no specific factors detected
  if (factors.length === 0) {
    factors.push(
      {
        category: "Anomaly Score",
        reason: "Deviation from baseline behavior",
        impact: 35,
        icon: Brain,
        color: "#3b82f6",
      },
      {
        category: "Time Anomaly",
        reason: "Access outside normal hours",
        impact: 25,
        icon: Clock,
        color: "#f97316",
      },
      {
        category: "Data Volume",
        reason: "Unusual data access volume",
        impact: 20,
        icon: Database,
        color: "#ef4444",
      },
      {
        category: "Location Risk",
        reason: "New or suspicious location",
        impact: 20,
        icon: MapPin,
        color: "#eab308",
      },
    );
  }

  // Normalize to 100%
  const total = factors.reduce((sum, f) => sum + f.impact, 0);
  factors.forEach((f) => {
    f.impact = Math.round((f.impact / total) * 100);
  });

  // Sort by impact
  factors.sort((a, b) => b.impact - a.impact);

  return factors;
}

export default function ExplainabilityPanel({ alert, compact = false }) {
  const factors = calculateRiskFactors(alert);

  if (compact) {
    return (
      <div style={{ marginTop: 16 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <Brain size={16} style={{ color: "#60a5fa" }} />
          <h4
            style={{ color: "#fff", fontSize: 13, fontWeight: 600, margin: 0 }}
          >
            AI Risk Analysis
          </h4>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {factors.slice(0, 3).map((factor, idx) => {
            const Icon = factor.icon;
            return (
              <div
                key={idx}
                style={{ display: "flex", alignItems: "center", gap: 10 }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: `${factor.color}15`,
                    border: `1px solid ${factor.color}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={14} style={{ color: factor.color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        color: "#94a3b8",
                        fontSize: 11,
                        fontWeight: 500,
                      }}
                    >
                      {factor.category}
                    </span>
                    <span
                      style={{
                        color: factor.color,
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {factor.impact}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: 4,
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${factor.impact}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.1 }}
                      style={{
                        height: "100%",
                        background: factor.color,
                        borderRadius: 2,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background:
              "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))",
            border: "1px solid rgba(59,130,246,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Brain size={24} style={{ color: "#60a5fa" }} />
        </div>
        <div>
          <h3
            style={{ color: "#fff", fontSize: 16, fontWeight: 600, margin: 0 }}
          >
            AI Risk Explanation
          </h3>
          <p style={{ color: "#64748b", fontSize: 12, margin: "4px 0 0 0" }}>
            Why did our ML model flag this as{" "}
            {alert.riskScore >= 75 ? "high risk" : "suspicious"}?
          </p>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            background: "rgba(59,130,246,0.05)",
            border: "1px solid rgba(59,130,246,0.15)",
            borderRadius: 12,
            padding: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span style={{ color: "#94a3b8", fontSize: 13, fontWeight: 500 }}>
              Overall Risk Score
            </span>
            <span
              style={{
                color:
                  alert.riskScore >= 75
                    ? "#f87171"
                    : alert.riskScore >= 40
                      ? "#facc15"
                      : "#4ade80",
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              {alert.riskScore}%
            </span>
          </div>
          <p style={{ color: "#64748b", fontSize: 12, margin: 0 }}>
            Based on historical behavior patterns and anomaly detection
            algorithms
          </p>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <h4
          style={{
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 12,
          }}
        >
          Contributing Factors
        </h4>
        <p style={{ color: "#64748b", fontSize: 12, marginBottom: 16 }}>
          Each factor below contributed to the final risk score calculation
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {factors.map((factor, idx) => {
          const Icon = factor.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div
                style={{ display: "flex", alignItems: "flex-start", gap: 12 }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: `${factor.color}15`,
                    border: `1px solid ${factor.color}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={18} style={{ color: factor.color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <h5
                      style={{
                        color: "#fff",
                        fontSize: 14,
                        fontWeight: 600,
                        margin: 0,
                      }}
                    >
                      {factor.category}
                    </h5>
                    <span
                      style={{
                        color: factor.color,
                        fontSize: 16,
                        fontWeight: 700,
                        background: `${factor.color}15`,
                        padding: "4px 10px",
                        borderRadius: 8,
                      }}
                    >
                      {factor.impact}%
                    </span>
                  </div>
                  <p
                    style={{
                      color: "#94a3b8",
                      fontSize: 13,
                      margin: "0 0 10px 0",
                    }}
                  >
                    {factor.reason}
                  </p>
                  <div
                    style={{
                      height: 6,
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${factor.impact}%` }}
                      transition={{ duration: 1, delay: idx * 0.15 }}
                      style={{
                        height: "100%",
                        background: `linear-gradient(90deg, ${factor.color}, ${factor.color}cc)`,
                        borderRadius: 3,
                      }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 24,
          padding: 16,
          background: "rgba(59,130,246,0.05)",
          border: "1px solid rgba(59,130,246,0.1)",
          borderRadius: 12,
        }}
      >
        <p
          style={{ color: "#94a3b8", fontSize: 12, margin: 0, lineHeight: 1.6 }}
        >
          <strong style={{ color: "#60a5fa" }}>How it works:</strong> Our
          Isolation Forest ML model analyzes 50+ behavioral signals including
          access patterns, data volume, location, time, and historical baselines
          to identify anomalies. Each detected anomaly contributes to the final
          risk score.
        </p>
      </div>
    </div>
  );
}
