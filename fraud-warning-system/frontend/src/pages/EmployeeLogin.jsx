import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle, UserCheck } from "lucide-react";
import { useEmployeeAuth } from "../context/EmployeeAuthContext";

export default function EmployeeLogin() {
  const { login } = useEmployeeAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ identity: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(form.identity, form.password);
      navigate("/employee/dashboard", { replace: true });
    } catch {
      setError("Invalid employee credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0e1a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: "100%", maxWidth: 420 }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "rgba(34,197,94,0.15)",
              border: "1px solid rgba(34,197,94,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <UserCheck size={32} style={{ color: "#4ade80" }} />
          </div>
          <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 700 }}>
            Employee Portal
          </h1>
          <p style={{ color: "#64748b", fontSize: 14 }}>
            Internal Banking Operations Console
          </p>
        </div>

        <div className="glass-card" style={{ padding: 32 }}>
          <h2
            style={{
              color: "#fff",
              fontSize: 20,
              fontWeight: 600,
              marginBottom: 24,
            }}
          >
            Employee Sign In
          </h2>

          {error && (
            <div
              style={{
                marginBottom: 16,
                padding: 12,
                borderRadius: 12,
                background: "rgba(239,68,68,0.1)",
                color: "#f87171",
                fontSize: 13,
                display: "flex",
                gap: 8,
              }}
            >
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            <div>
              <label
                style={{
                  color: "#94a3b8",
                  fontSize: 13,
                  marginBottom: 6,
                  display: "block",
                }}
              >
                Employee ID, Name, or Email
              </label>
              <input
                type="text"
                value={form.identity}
                onChange={(e) =>
                  setForm((p) => ({ ...p, identity: e.target.value }))
                }
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  padding: "12px 16px",
                  color: "#fff",
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <p style={{ color: "#64748b", fontSize: 11, marginTop: 6 }}>
                Default format: id = full name without spaces, password = id@123
              </p>
            </div>

            <div>
              <label
                style={{
                  color: "#94a3b8",
                  fontSize: 13,
                  marginBottom: 6,
                  display: "block",
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, password: e.target.value }))
                  }
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    padding: "12px 48px 12px 16px",
                    color: "#fff",
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#64748b",
                    cursor: "pointer",
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                background: "#22c55e",
                border: "none",
                borderRadius: 12,
                padding: 14,
                color: "#fff",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
