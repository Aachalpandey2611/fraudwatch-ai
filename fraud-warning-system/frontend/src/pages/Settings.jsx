import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Brain, Save, RefreshCw, Shield } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

const ALGORITHM_OPTIONS = [
  { value: "isolation_forest", label: "Isolation Forest" },
  { value: "autoencoder", label: "Autoencoder" },
  { value: "one_class_svm", label: "One-Class SVM" },
  { value: "local_outlier_factor", label: "Local Outlier Factor" },
];

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    activeAlgorithm: "isolation_forest",
    riskThreshold: 70,
    modelSensitivity: "medium",
  });

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/ml/config");
      if (response.data?.success && response.data?.data) {
        const data = response.data.data;
        setConfig({
          activeAlgorithm: data.activeAlgorithm || "isolation_forest",
          riskThreshold: Number(data.riskThreshold || 70),
          modelSensitivity: data.modelSensitivity || "medium",
        });
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load ML settings",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const saveConfig = async () => {
    setSaving(true);
    try {
      const response = await api.put("/api/ml/config", config);
      if (response.data?.success) {
        toast.success("ML configuration updated");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save configuration",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        maxWidth: 760,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 700 }}>
            Model Management
          </h1>
          <p style={{ color: "#64748b", fontSize: 14 }}>
            Configure live ML detection behavior used by fraud alerting
            pipeline.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={fetchConfig}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              borderRadius: 10,
              border: "1px solid rgba(148,163,184,0.3)",
              background: "rgba(148,163,184,0.1)",
              color: "#cbd5e1",
              padding: "10px 14px",
              cursor: "pointer",
            }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={saveConfig}
            disabled={saving || loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg, #3b82f6, #2563eb)",
              color: "#fff",
              padding: "10px 14px",
              cursor: saving ? "wait" : "pointer",
              fontWeight: 700,
            }}
          >
            <Save size={14} /> {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 20 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 16,
          }}
        >
          <Brain size={16} style={{ color: "#60a5fa" }} />
          <h2
            style={{ color: "#fff", fontSize: 16, fontWeight: 600, margin: 0 }}
          >
            Detection Configuration
          </h2>
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          <label style={{ color: "#94a3b8", fontSize: 12 }}>
            Active Algorithm
            <select
              value={config.activeAlgorithm}
              onChange={(e) =>
                setConfig((p) => ({ ...p, activeAlgorithm: e.target.value }))
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
            >
              {ALGORITHM_OPTIONS.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  style={{ background: "#0f172a" }}
                >
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label style={{ color: "#94a3b8", fontSize: 12 }}>
            Risk Threshold:{" "}
            <span style={{ color: "#fff", fontWeight: 700 }}>
              {config.riskThreshold}
            </span>
            <input
              type="range"
              min="1"
              max="100"
              value={config.riskThreshold}
              onChange={(e) =>
                setConfig((p) => ({
                  ...p,
                  riskThreshold: Number(e.target.value),
                }))
              }
              style={{ marginTop: 8, width: "100%" }}
            />
          </label>

          <label style={{ color: "#94a3b8", fontSize: 12 }}>
            Model Sensitivity
            <div style={{ marginTop: 6, display: "flex", gap: 8 }}>
              {["low", "medium", "high"].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() =>
                    setConfig((p) => ({ ...p, modelSensitivity: s }))
                  }
                  style={{
                    textTransform: "capitalize",
                    padding: "8px 12px",
                    borderRadius: 10,
                    border:
                      config.modelSensitivity === s
                        ? "1px solid rgba(59,130,246,0.6)"
                        : "1px solid rgba(255,255,255,0.1)",
                    background:
                      config.modelSensitivity === s
                        ? "rgba(59,130,246,0.2)"
                        : "rgba(255,255,255,0.04)",
                    color:
                      config.modelSensitivity === s ? "#93c5fd" : "#cbd5e1",
                    cursor: "pointer",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </label>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 16 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 8,
          }}
        >
          <Shield size={14} style={{ color: "#22c55e" }} />
          <strong style={{ color: "#fff", fontSize: 13 }}>
            Production Fraud Pipeline
          </strong>
        </div>
        <div style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.6 }}>
          Employee action → API validation → MongoDB write → ML analyze →
          threshold check → alert creation → socket push.
        </div>
      </div>
    </motion.div>
  );
}
