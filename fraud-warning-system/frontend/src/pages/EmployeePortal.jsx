import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Edit3,
  ArrowLeftRight,
  FileText,
  Download,
  ShieldAlert,
  Send,
  Sparkles,
  BadgeCheck,
  Gauge,
  BellRing,
  Clock3,
} from "lucide-react";
import toast from "react-hot-toast";
import { useEmployeeAuth } from "../context/EmployeeAuthContext";

const DEFAULT_API_BASE = import.meta.env.PROD
  ? "https://fraudwatch-backend.onrender.com"
  : "http://localhost:4000";
const API_BASE = import.meta.env.VITE_API_URL || DEFAULT_API_BASE;

const normalizeMlForDisplay = (ml) => {
  if (!ml) return null;
  const isAnomaly = Boolean(ml.isAnomaly);
  const rawRisk = Math.max(0, Math.min(100, Number(ml.riskScore) || 0));
  const decisionScore = Number(ml.decisionScore);
  const anomalyScore = Number(ml.anomalyScore);

  let riskFromSignal = rawRisk;
  if (Number.isFinite(decisionScore)) {
    const anomalyProb = 1 / (1 + Math.exp(3 * decisionScore));
    riskFromSignal = Math.max(0, Math.min(100, Math.round(anomalyProb * 100)));
  } else if (Number.isFinite(anomalyScore)) {
    const anomalyProb = 1 / (1 + Math.exp(12 * (anomalyScore + 0.5)));
    riskFromSignal = Math.max(0, Math.min(100, Math.round(anomalyProb * 100)));
  }

  let riskScore = Math.max(
    0,
    Math.min(100, Math.round(riskFromSignal * 0.65 + rawRisk * 0.35)),
  );
  if (!isAnomaly) riskScore = Math.min(riskScore, 74);
  if (isAnomaly) riskScore = Math.max(riskScore, 35);

  return {
    ...ml,
    isAnomaly,
    riskScore,
  };
};

const playFraudTone = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(520, ctx.currentTime + 0.24);

    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.32);
    osc.onended = () => {
      ctx.close().catch(() => {});
    };
  } catch {
    // Ignore audio errors (autoplay and browser policy constraints).
  }
};

const ACTIONS = [
  {
    type: "customer_lookup",
    label: "Customer Lookup",
    icon: Search,
    defaults: { accountsAccessed: 1, dataVolume: 2, transactionAmount: 0 },
  },
  {
    type: "account_modification",
    label: "Account Modification",
    icon: Edit3,
    defaults: { accountsAccessed: 1, dataVolume: 5, transactionAmount: 0 },
  },
  {
    type: "transaction",
    label: "Transaction Processing",
    icon: ArrowLeftRight,
    defaults: { accountsAccessed: 1, dataVolume: 1, transactionAmount: 25000 },
  },
  {
    type: "report_generation",
    label: "Report Generation",
    icon: FileText,
    defaults: { accountsAccessed: 10, dataVolume: 20, transactionAmount: 0 },
  },
  {
    type: "bulk_download",
    label: "Bulk Data Download",
    icon: Download,
    defaults: { accountsAccessed: 40, dataVolume: 350, transactionAmount: 0 },
  },
  {
    type: "privilege_escalation",
    label: "Privilege Escalation",
    icon: ShieldAlert,
    defaults: { accountsAccessed: 0, dataVolume: 1, transactionAmount: 0 },
  },
];

export default function EmployeePortal() {
  const { employee, logout } = useEmployeeAuth();
  const [actionType, setActionType] = useState("customer_lookup");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [sessionEvents, setSessionEvents] = useState([]);
  const [form, setForm] = useState({
    accountsAccessed: 1,
    dataVolume: 2,
    transactionAmount: 0,
    sessionDuration: 12,
    location: "Main Branch",
    systemAccessed: "Core Banking",
  });

  const selectedAction = useMemo(
    () => ACTIONS.find((a) => a.type === actionType) || ACTIONS[0],
    [actionType],
  );

  const sessionStats = useMemo(() => {
    const count = sessionEvents.length;
    if (!count) return { count: 0, avgRisk: 0, anomalies: 0 };
    const totalRisk = sessionEvents.reduce(
      (acc, event) => acc + Number(event.riskScore || 0),
      0,
    );
    const anomalies = sessionEvents.filter((event) => event.isAnomaly).length;
    return {
      count,
      avgRisk: Math.round(totalRisk / count),
      anomalies,
    };
  }, [sessionEvents]);

  const applyActionDefaults = (type) => {
    const next = ACTIONS.find((a) => a.type === type);
    setActionType(type);
    if (!next) return;
    setForm((prev) => ({
      ...prev,
      ...next.defaults,
      sessionDuration: prev.sessionDuration || 12,
      location: prev.location || "Main Branch",
      systemAccessed: prev.systemAccessed || "Core Banking",
    }));
  };

  const submitActivity = async (e) => {
    e.preventDefault();
    if (!employee) return;

    setSubmitting(true);
    setResult(null);
    try {
      const payload = {
        clientLocalHour: new Date().getHours(),
        clientDayOfWeek:
          new Date().getDay() === 0 ? 6 : new Date().getDay() - 1,
        employeeId: String(employee.employeeId || employee.id),
        employeeName: employee.name,
        department: employee.department || "Customer Service",
        role: "employee",
        actionType,
        accountsAccessed: Number(form.accountsAccessed || 0),
        dataVolume: Number(form.dataVolume || 0),
        transactionAmount: Number(form.transactionAmount || 0),
        sessionDuration: Number(form.sessionDuration || 0),
        location: form.location,
        systemAccessed: form.systemAccessed,
        timestamp: new Date().toISOString(),
      };

      const token = localStorage.getItem("fw_employee_token");
      const response = await fetch(`${API_BASE}/api/activities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Failed to submit activity");
      }
      const ml = normalizeMlForDisplay(data?.mlResult);
      const mlStatus = data?.mlStatus || "ml";
      setResult(ml ? { ...ml, mlStatus } : null);
      const event = {
        id: `${Date.now()}-${Math.random()}`,
        actionType,
        timestamp: payload.timestamp,
        riskScore: Number(ml?.riskScore || 0),
        isAnomaly: Boolean(ml?.isAnomaly),
        mlStatus,
      };
      setSessionEvents((prev) => [event, ...prev].slice(0, 12));

      if (event.isAnomaly) {
        playFraudTone();
        toast.error("High-risk activity detected and sent to admin dashboard");
      } else if (mlStatus === "fallback") {
        toast(
          "Activity logged. ML service is unavailable, fallback scoring used.",
          {
            icon: "⚠️",
          },
        );
      } else {
        toast.success("Activity submitted and analyzed by ML");
      }
    } catch (error) {
      toast.error(error.message || "Failed to submit activity");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ display: "flex", flexDirection: "column", gap: 20 }}
    >
      <div
        className="glass-card"
        style={{
          padding: 20,
          position: "relative",
          overflow: "hidden",
          border: "1px solid rgba(59,130,246,0.18)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 0.35, scale: 1 }}
          transition={{ duration: 0.6 }}
          style={{
            position: "absolute",
            width: 240,
            height: 240,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(37,99,235,0.35), rgba(37,99,235,0))",
            right: -70,
            top: -90,
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: 18,
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 6,
              }}
            >
              <Sparkles size={15} style={{ color: "#60a5fa" }} />
              <span style={{ color: "#93c5fd", fontSize: 12, fontWeight: 600 }}>
                Employee Intelligence Workspace
              </span>
            </div>
            <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 700 }}>
              Welcome back, {employee?.name || "Employee"}
            </h1>
            <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 6 }}>
              ID: {employee?.employeeId || employee?.id} • Department:{" "}
              {employee?.department || "Customer Service"}
            </p>
            <p
              style={{
                color: "#64748b",
                fontSize: 13,
                marginTop: 10,
                maxWidth: 560,
              }}
            >
              Submit secure actions, monitor your risk footprint, and receive
              instant fraud checks from the ML engine.
            </p>

            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 14,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  color: "#34d399",
                  fontSize: 12,
                  border: "1px solid rgba(52,211,153,0.35)",
                  borderRadius: 999,
                  padding: "4px 10px",
                }}
              >
                <BadgeCheck
                  size={12}
                  style={{ display: "inline", marginRight: 6 }}
                />{" "}
                Identity verified
              </span>
              <span
                style={{
                  color: "#60a5fa",
                  fontSize: 12,
                  border: "1px solid rgba(96,165,250,0.35)",
                  borderRadius: 999,
                  padding: "4px 10px",
                }}
              >
                <BellRing
                  size={12}
                  style={{ display: "inline", marginRight: 6 }}
                />{" "}
                Live ML scoring
              </span>
            </div>
          </div>

          <img
            src="/employee-portal-scene.svg"
            alt="Employee security workspace"
            style={{
              width: "100%",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 12px 30px rgba(2,6,23,0.45)",
            }}
          />
        </div>

        <button
          onClick={logout}
          style={{
            position: "absolute",
            right: 16,
            bottom: 16,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "transparent",
            color: "#cbd5e1",
            borderRadius: 8,
            padding: "4px 10px",
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          Logout
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
        }}
      >
        <div className="glass-card" style={{ padding: 14 }}>
          <p style={{ color: "#64748b", fontSize: 12 }}>Actions this session</p>
          <p style={{ color: "#fff", fontSize: 24, fontWeight: 700 }}>
            {sessionStats.count}
          </p>
        </div>
        <div className="glass-card" style={{ padding: 14 }}>
          <p style={{ color: "#64748b", fontSize: 12 }}>Average risk</p>
          <p style={{ color: "#fff", fontSize: 24, fontWeight: 700 }}>
            {sessionStats.avgRisk}
          </p>
        </div>
        <div className="glass-card" style={{ padding: 14 }}>
          <p style={{ color: "#64748b", fontSize: 12 }}>Anomalies flagged</p>
          <p style={{ color: "#fff", fontSize: 24, fontWeight: 700 }}>
            {sessionStats.anomalies}
          </p>
        </div>
        <div className="glass-card" style={{ padding: 14 }}>
          <p style={{ color: "#64748b", fontSize: 12 }}>Last check</p>
          <p style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}>
            {result ? `${Number(result.riskScore || 0)} risk` : "Pending"}
          </p>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 10,
        }}
      >
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          const active = action.type === actionType;
          return (
            <button
              key={action.type}
              onClick={() => applyActionDefaults(action.type)}
              style={{
                borderRadius: 12,
                border: active
                  ? "1px solid rgba(59,130,246,0.6)"
                  : "1px solid rgba(255,255,255,0.1)",
                background: active
                  ? "rgba(59,130,246,0.2)"
                  : "rgba(255,255,255,0.03)",
                color: active ? "#93c5fd" : "#cbd5e1",
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
                textAlign: "left",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <Icon size={14} /> {action.label}
            </button>
          );
        })}
      </div>

      <form
        onSubmit={submitActivity}
        className="glass-card"
        style={{
          padding: 20,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
        }}
      >
        <label style={{ color: "#94a3b8", fontSize: 12 }}>
          Accounts Accessed
          <input
            type="number"
            min="0"
            value={form.accountsAccessed}
            onChange={(e) =>
              setForm((p) => ({ ...p, accountsAccessed: e.target.value }))
            }
            style={{
              marginTop: 6,
              width: "100%",
              borderRadius: 10,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#fff",
              padding: "10px 12px",
            }}
          />
        </label>

        <label style={{ color: "#94a3b8", fontSize: 12 }}>
          Data Volume (MB)
          <input
            type="number"
            min="0"
            value={form.dataVolume}
            onChange={(e) =>
              setForm((p) => ({ ...p, dataVolume: e.target.value }))
            }
            style={{
              marginTop: 6,
              width: "100%",
              borderRadius: 10,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#fff",
              padding: "10px 12px",
            }}
          />
        </label>

        <label style={{ color: "#94a3b8", fontSize: 12 }}>
          Transaction Amount
          <input
            type="number"
            min="0"
            value={form.transactionAmount}
            onChange={(e) =>
              setForm((p) => ({ ...p, transactionAmount: e.target.value }))
            }
            style={{
              marginTop: 6,
              width: "100%",
              borderRadius: 10,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#fff",
              padding: "10px 12px",
            }}
          />
        </label>

        <label style={{ color: "#94a3b8", fontSize: 12 }}>
          Session Duration (min)
          <input
            type="number"
            min="1"
            value={form.sessionDuration}
            onChange={(e) =>
              setForm((p) => ({ ...p, sessionDuration: e.target.value }))
            }
            style={{
              marginTop: 6,
              width: "100%",
              borderRadius: 10,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#fff",
              padding: "10px 12px",
            }}
          />
        </label>

        <label style={{ color: "#94a3b8", fontSize: 12 }}>
          Location
          <input
            type="text"
            value={form.location}
            onChange={(e) =>
              setForm((p) => ({ ...p, location: e.target.value }))
            }
            style={{
              marginTop: 6,
              width: "100%",
              borderRadius: 10,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#fff",
              padding: "10px 12px",
            }}
          />
        </label>

        <label style={{ color: "#94a3b8", fontSize: 12 }}>
          System Accessed
          <input
            type="text"
            value={form.systemAccessed}
            onChange={(e) =>
              setForm((p) => ({ ...p, systemAccessed: e.target.value }))
            }
            style={{
              marginTop: 6,
              width: "100%",
              borderRadius: 10,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#fff",
              padding: "10px 12px",
            }}
          />
        </label>

        <div
          style={{
            gridColumn: "1 / -1",
            display: "flex",
            gap: 12,
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <button
            type="submit"
            disabled={submitting}
            style={{
              border: "none",
              borderRadius: 10,
              background: "linear-gradient(135deg, #3b82f6, #2563eb)",
              color: "#fff",
              padding: "10px 16px",
              fontSize: 13,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: submitting ? "wait" : "pointer",
            }}
          >
            <Send size={14} />
            {submitting ? "Submitting..." : `Submit ${selectedAction.label}`}
          </button>

          {result && (
            <div
              style={{
                color: "#cbd5e1",
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span>
                <Gauge
                  size={13}
                  style={{ display: "inline", marginRight: 6 }}
                />
                Risk{" "}
                <span style={{ color: "#fff", fontWeight: 700 }}>
                  {result.riskScore}
                </span>
              </span>
              <span
                style={{
                  color: result.isAnomaly ? "#f87171" : "#4ade80",
                  fontWeight: 700,
                }}
              >
                {result.isAnomaly ? "Anomaly Detected" : "Normal Pattern"}
              </span>
              <span style={{ color: "#94a3b8", fontWeight: 600 }}>
                {result.mlStatus === "fallback"
                  ? "Fallback Scoring"
                  : "ML Scored"}
              </span>
            </div>
          )}
        </div>
      </form>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: 14,
          alignItems: "start",
        }}
      >
        <div className="glass-card" style={{ padding: 16 }}>
          <h3
            style={{
              color: "#fff",
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 10,
            }}
          >
            Your Recent Activity Pulse
          </h3>
          {sessionEvents.length === 0 ? (
            <p style={{ color: "#64748b", fontSize: 13 }}>
              No activity submitted yet in this session.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {sessionEvents.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10,
                    padding: "8px 10px",
                    background: "rgba(255,255,255,0.02)",
                    display: "grid",
                    gridTemplateColumns: "120px 1fr auto",
                    gap: 10,
                    alignItems: "center",
                    color: "#cbd5e1",
                    fontSize: 12,
                  }}
                >
                  <span
                    style={{
                      color: "#94a3b8",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Clock3 size={11} />
                    {new Date(entry.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                  <span>{String(entry.actionType).replace(/_/g, " ")}</span>
                  <span
                    style={{
                      color:
                        entry.riskScore >= 75
                          ? "#f87171"
                          : entry.riskScore >= 40
                            ? "#facc15"
                            : "#4ade80",
                      fontWeight: 700,
                    }}
                  >
                    {entry.riskScore}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card" style={{ padding: 16 }}>
          <h3
            style={{
              color: "#fff",
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 10,
            }}
          >
            Smart Guidance
          </h3>
          <ul
            style={{
              margin: 0,
              paddingLeft: 18,
              color: "#94a3b8",
              fontSize: 13,
              lineHeight: 1.8,
            }}
          >
            <li>Use least-privilege workflows whenever possible.</li>
            <li>Avoid high-volume downloads without a ticket reference.</li>
            <li>Keep session durations consistent with your normal shifts.</li>
            <li>Review anomaly prompts before escalating sensitive actions.</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
