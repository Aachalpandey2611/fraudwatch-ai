import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  LogIn,
  Search,
  ArrowLeftRight,
  Download,
  UserCog,
  ShieldAlert,
  Play,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

const DEMO_EMPLOYEES = [
  {
    employeeId: "EMP1021",
    employeeName: "Nina Patel",
    department: "Customer Service",
    location: "Main Branch",
  },
  {
    employeeId: "EMP2042",
    employeeName: "Rahul Mehta",
    department: "Operations",
    location: "City Branch",
  },
  {
    employeeId: "EMP3188",
    employeeName: "Emily Carter",
    department: "Wealth Management",
    location: "HQ",
  },
  {
    employeeId: "EMP4410",
    employeeName: "David Kim",
    department: "Compliance",
    location: "Remote VPN",
  },
];

const ACTIONS = [
  {
    key: "login",
    label: "Login Event",
    icon: LogIn,
    defaults: {
      accountsAccessed: 0,
      dataVolume: 0,
      transactionAmount: 0,
      sessionDuration: 6,
      systemAccessed: "Access Gateway",
    },
  },
  {
    key: "customer_lookup",
    label: "Customer Lookup",
    icon: Search,
    defaults: {
      accountsAccessed: 2,
      dataVolume: 3,
      transactionAmount: 0,
      sessionDuration: 9,
      systemAccessed: "CRM",
    },
  },
  {
    key: "transaction",
    label: "Transaction",
    icon: ArrowLeftRight,
    defaults: {
      accountsAccessed: 1,
      dataVolume: 2,
      transactionAmount: 32000,
      sessionDuration: 12,
      systemAccessed: "Core Banking",
    },
  },
  {
    key: "bulk_download",
    label: "Bulk Download",
    icon: Download,
    defaults: {
      accountsAccessed: 35,
      dataVolume: 280,
      transactionAmount: 0,
      sessionDuration: 16,
      systemAccessed: "Data Warehouse",
    },
  },
  {
    key: "account_modification",
    label: "Account Modification",
    icon: UserCog,
    defaults: {
      accountsAccessed: 4,
      dataVolume: 8,
      transactionAmount: 0,
      sessionDuration: 14,
      systemAccessed: "Admin Console",
    },
  },
  {
    key: "privilege_escalation",
    label: "Privilege Escalation",
    icon: ShieldAlert,
    defaults: {
      accountsAccessed: 1,
      dataVolume: 1,
      transactionAmount: 0,
      sessionDuration: 4,
      systemAccessed: "IAM",
    },
  },
];

const jitter = (value, range = 0.2) => {
  const delta = value * range;
  return Math.max(0, Math.round(value + (Math.random() * 2 - 1) * delta));
};

export default function LiveDemo() {
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [recent, setRecent] = useState([]);

  const orderedRecent = useMemo(() => recent.slice(0, 8), [recent]);

  const fireAction = async (action) => {
    setSending(true);
    try {
      const employee =
        DEMO_EMPLOYEES[Math.floor(Math.random() * DEMO_EMPLOYEES.length)];
      const payload = {
        employeeId: employee.employeeId,
        employeeName: employee.employeeName,
        department: employee.department,
        actionType: action.key,
        accountsAccessed: jitter(action.defaults.accountsAccessed || 0, 0.35),
        dataVolume: jitter(action.defaults.dataVolume || 0, 0.3),
        transactionAmount: jitter(action.defaults.transactionAmount || 0, 0.25),
        sessionDuration: jitter(action.defaults.sessionDuration || 1, 0.25),
        location: employee.location,
        systemAccessed: action.defaults.systemAccessed,
        timestamp: new Date().toISOString(),
      };

      const { data } = await api.post("/api/activities", payload);
      const ml = data?.mlResult || null;
      const item = {
        id: `${Date.now()}-${Math.random()}`,
        timestamp: payload.timestamp,
        employeeName: payload.employeeName,
        department: payload.department,
        actionType: payload.actionType,
        riskScore: Number(ml?.riskScore || 0),
        isAnomaly: Boolean(ml?.isAnomaly),
      };
      setRecent((prev) => [item, ...prev]);
      setLastResult(item);

      if (item.isAnomaly) {
        toast.error(
          `Anomaly detected for ${item.employeeName} (${item.riskScore})`,
        );
      } else {
        toast.success(`Activity submitted for ${item.employeeName}`);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to submit activity",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ display: "flex", flexDirection: "column", gap: 24 }}
    >
      <div>
        <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 700 }}>
          Live Demo
        </h1>
        <p style={{ color: "#64748b", fontSize: 14 }}>
          Trigger real activity events through the production ML fraud pipeline.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
        }}
      >
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.key}
              onClick={() => fireAction(action)}
              disabled={sending}
              style={{
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.04)",
                color: "#cbd5e1",
                fontSize: 13,
                fontWeight: 600,
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                gap: 9,
                cursor: sending ? "wait" : "pointer",
                textAlign: "left",
              }}
            >
              <Icon size={14} />
              <span>{action.label}</span>
              <Play size={12} style={{ marginLeft: "auto", opacity: 0.8 }} />
            </button>
          );
        })}
      </div>

      <div
        className="glass-card"
        style={{
          padding: 18,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <h3 style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>
          Latest Pipeline Result
        </h3>
        {!lastResult ? (
          <p style={{ color: "#64748b", fontSize: 13 }}>
            Trigger any action to send a real activity to the backend and ML
            service.
          </p>
        ) : (
          <div style={{ color: "#cbd5e1", fontSize: 13, lineHeight: 1.7 }}>
            <div>
              {lastResult.employeeName} • {lastResult.department}
            </div>
            <div>
              {String(lastResult.actionType).replace(/_/g, " ")} • Risk{" "}
              {lastResult.riskScore}
            </div>
            <div
              style={{ color: lastResult.isAnomaly ? "#f87171" : "#4ade80" }}
            >
              {lastResult.isAnomaly
                ? "Anomaly detected and alert may be generated"
                : "Normal activity"}
            </div>
          </div>
        )}
      </div>

      <div className="glass-card" style={{ padding: 18 }}>
        <h3
          style={{
            color: "#fff",
            fontSize: 16,
            fontWeight: 600,
            marginBottom: 12,
          }}
        >
          Recent Demo Events
        </h3>
        {orderedRecent.length === 0 ? (
          <p style={{ color: "#64748b", fontSize: 13 }}>
            No events triggered yet.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {orderedRecent.map((entry) => (
              <div
                key={entry.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "130px 1fr auto",
                  gap: 10,
                  alignItems: "center",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: 10,
                  padding: "8px 10px",
                  color: "#cbd5e1",
                  fontSize: 12,
                }}
              >
                <span style={{ color: "#94a3b8" }}>
                  {new Date(entry.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
                <span>
                  {entry.employeeName} •{" "}
                  {String(entry.actionType).replace(/_/g, " ")}
                </span>
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
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
