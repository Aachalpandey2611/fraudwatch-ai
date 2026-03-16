import { Clock3, ShieldAlert } from "lucide-react";

const getRiskColor = (risk) => {
  if (risk >= 75) return "#ef4444";
  if (risk >= 40) return "#f59e0b";
  return "#22c55e";
};

const prettyAction = (action) =>
  String(action || "activity")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

export default function FraudTimeline({ events = [] }) {
  if (!events.length) {
    return (
      <div
        style={{
          textAlign: "center",
          color: "#64748b",
          fontSize: 13,
          padding: "32px 12px",
          border: "1px dashed rgba(255,255,255,0.1)",
          borderRadius: 12,
          background: "rgba(255,255,255,0.02)",
        }}
      >
        No timeline events yet
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {events
        .slice()
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .map((event, index) => {
          const activityType = event.actionType || event.activityType;
          const risk = Number(event.riskScore || 0);
          const riskColor = getRiskColor(risk);
          const ts = new Date(event.timestamp);
          return (
            <div
              key={`${event._id || event.timestamp}-${index}`}
              style={{
                display: "grid",
                gridTemplateColumns: "90px 20px 1fr",
                gap: 12,
                alignItems: "start",
              }}
            >
              <div style={{ color: "#94a3b8", fontSize: 12, paddingTop: 1 }}>
                {ts.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: riskColor,
                    marginTop: 3,
                    boxShadow: `0 0 0 3px ${riskColor}22`,
                  }}
                />
                {index < events.length - 1 && (
                  <div
                    style={{
                      width: 2,
                      flex: 1,
                      minHeight: 28,
                      background: "rgba(148,163,184,0.25)",
                      marginTop: 6,
                    }}
                  />
                )}
              </div>

              <div
                style={{
                  border: `1px solid ${riskColor}33`,
                  borderRadius: 10,
                  padding: "10px 12px",
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    marginBottom: 6,
                  }}
                >
                  <div style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>
                    {prettyAction(activityType)}
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <ShieldAlert size={12} style={{ color: riskColor }} />
                    <span
                      style={{
                        color: riskColor,
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {risk}
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    color: "#94a3b8",
                    fontSize: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <span>{event.department || "Unknown"}</span>
                  <span style={{ opacity: 0.4 }}>•</span>
                  <span>{event.employeeName || "Unknown Employee"}</span>
                  <span style={{ opacity: 0.4 }}>•</span>
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <Clock3 size={11} />
                    {ts.toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
}
