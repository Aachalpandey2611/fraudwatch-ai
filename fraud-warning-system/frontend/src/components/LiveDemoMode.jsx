import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  X,
  Check,
  AlertTriangle,
  Search,
  FileText,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

const DEMO_STEPS = [
  {
    id: 1,
    title: "Normal Employee Activity",
    description:
      "Sarah Johnson, a Loan Officer, logs in at 9:00 AM and accesses 12 customer records during business hours.",
    icon: Check,
    color: "#22c55e",
    duration: 2500,
    data: {
      employee: "Sarah Johnson",
      time: "9:00 AM",
      records: 12,
      status: "Normal",
    },
  },
  {
    id: 2,
    title: "Suspicious Behavior Detected",
    description:
      "System detects Marcus Thompson logging in at 2:34 AM from an unrecognized VPN location.",
    icon: AlertTriangle,
    color: "#f97316",
    duration: 3000,
    data: {
      employee: "Marcus Thompson",
      time: "2:34 AM",
      location: "Unknown VPN",
      status: "Suspicious",
    },
  },
  {
    id: 3,
    title: "ML Model Analysis",
    description:
      "AI analyzes behavior patterns: bulk download of 1.2GB customer data, 247 accounts accessed in single session.",
    icon: Search,
    color: "#3b82f6",
    duration: 3500,
    data: {
      dataVolume: "1.2GB",
      accounts: 247,
      anomalyScore: 96,
      status: "Analyzing",
    },
  },
  {
    id: 4,
    title: "Critical Alert Generated",
    description:
      "Risk score calculated at 96%. Alert FW-2024-001 created and routed to fraud investigation team.",
    icon: AlertTriangle,
    color: "#ef4444",
    duration: 3000,
    data: {
      alertId: "FW-2024-001",
      riskScore: 96,
      severity: "Critical",
      status: "Alert Created",
    },
  },
  {
    id: 5,
    title: "Investigation Assigned",
    description:
      "Alert assigned to Senior Analyst Sarah Chen. Evidence collected: access logs, download history, location data.",
    icon: FileText,
    color: "#8b5cf6",
    duration: 2500,
    data: {
      analyst: "Sarah Chen",
      evidence: ["Access Logs", "Download History", "Location Data"],
      status: "Investigating",
    },
  },
  {
    id: 6,
    title: "Threat Contained",
    description:
      "Account suspended, data access revoked. Security team notified. Potential data breach prevented!",
    icon: ShieldCheck,
    color: "#22c55e",
    duration: 3000,
    data: {
      action: "Account Suspended",
      impact: "Data Breach Prevented",
      savedAmount: "$2.4M",
      status: "Resolved",
    },
  },
];

export default function LiveDemoMode() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isPlaying || currentStep >= DEMO_STEPS.length) return;

    const step = DEMO_STEPS[currentStep];
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentStep((s) => s + 1);
          return 0;
        }
        return prev + 100 / (step.duration / 50);
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, currentStep]);

  useEffect(() => {
    if (currentStep >= DEMO_STEPS.length && isPlaying) {
      setIsPlaying(false);
    }
  }, [currentStep, isPlaying]);

  const startDemo = () => {
    setCurrentStep(0);
    setProgress(0);
    setIsPlaying(true);
    setIsOpen(true);
  };

  const resetDemo = () => {
    setCurrentStep(0);
    setProgress(0);
    setIsPlaying(false);
  };

  const step = DEMO_STEPS[currentStep];
  const Icon = step?.icon;

  return (
    <>
      <style>{`
        @keyframes demoPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.5), 0 4px 20px rgba(59,130,246,0.35); }
          50% { box-shadow: 0 0 0 8px rgba(59,130,246,0), 0 4px 28px rgba(139,92,246,0.5); }
        }
        .live-demo-btn { animation: demoPulse 2s ease-in-out infinite; }
        .live-demo-btn:hover { animation: none !important; }
      `}</style>
      {/* Start Demo Button */}
      <button
        className="live-demo-btn"
        onClick={startDemo}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "11px 22px",
          borderRadius: 12,
          border: "1px solid rgba(99,102,241,0.7)",
          background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
          color: "#fff",
          fontSize: 13,
          fontWeight: 700,
          cursor: "pointer",
          transition: "all 0.2s",
          letterSpacing: "0.02em",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background =
            "linear-gradient(135deg, #2563eb, #7c3aed)";
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 8px 32px rgba(59,130,246,0.55)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background =
            "linear-gradient(135deg, #3b82f6, #8b5cf6)";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "";
        }}
      >
        <Play size={14} fill="#fff" /> Live Demo
      </button>

      {/* Demo Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.7)",
                zIndex: 10000,
                backdropFilter: "blur(4px)",
              }}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: "-50%", y: "calc(-50% + 50px)" }}
              animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
              exit={{ opacity: 0, scale: 0.9, x: "-50%", y: "calc(-50% + 50px)" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                width: "min(90vw, 700px)",
                maxHeight: "calc(100vh - 40px)",
                background:
                  "linear-gradient(180deg, rgba(15,22,41,0.98) 0%, rgba(10,14,26,0.98) 100%)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 24,
                boxShadow: "0 25px 80px rgba(0,0,0,0.8)",
                zIndex: 10001,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: "16px 24px",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(59,130,246,0.05)",
                  flexShrink: 0,
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
                    <h2
                      style={{
                        color: "#fff",
                        fontSize: 20,
                        fontWeight: 700,
                        margin: 0,
                      }}
                    >
                      🎬 Live Fraud Detection Demo
                    </h2>
                    <p
                      style={{
                        color: "#64748b",
                        fontSize: 13,
                        margin: "4px 0 0 0",
                      }}
                    >
                      Watch how our AI detects and prevents internal fraud in
                      real-time
                    </p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.background = "rgba(239,68,68,0.15)")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.background = "rgba(255,255,255,0.05)")
                    }
                  >
                    <X size={18} style={{ color: "#94a3b8" }} />
                  </button>
                </div>
              </div>

              {/* Progress Steps */}
              <div
                style={{
                  padding: "12px 24px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    position: "relative",
                  }}
                >
                  {DEMO_STEPS.map((s, idx) => (
                    <div
                      key={s.id}
                      style={{
                        position: "relative",
                        zIndex: 2,
                        textAlign: "center",
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background:
                            idx < currentStep
                              ? "#22c55e"
                              : idx === currentStep
                                ? s.color
                                : "rgba(255,255,255,0.05)",
                          border:
                            idx <= currentStep
                              ? `2px solid ${idx < currentStep ? "#22c55e" : s.color}`
                              : "2px solid rgba(255,255,255,0.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto",
                          transition: "all 0.3s",
                        }}
                      >
                        {idx < currentStep ? (
                          <Check size={16} color="#fff" />
                        ) : (
                          <span
                            style={{
                              color: idx === currentStep ? "#fff" : "#64748b",
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            {idx + 1}
                          </span>
                        )}
                      </div>
                      <p
                        style={{
                          color: idx <= currentStep ? "#fff" : "#64748b",
                          fontSize: 9,
                          marginTop: 6,
                          fontWeight: 500,
                        }}
                      >
                        {s.title.split(" ")[0]}
                      </p>
                    </div>
                  ))}
                  {/* Connecting Line */}
                  <div
                    style={{
                      position: "absolute",
                      top: 16,
                      left: "8%",
                      right: "8%",
                      height: 2,
                      background: "rgba(255,255,255,0.1)",
                      zIndex: 1,
                    }}
                  >
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{
                        width: `${(currentStep / (DEMO_STEPS.length - 1)) * 100}%`,
                      }}
                      transition={{ duration: 0.5 }}
                      style={{ height: "100%", background: "#22c55e" }}
                    />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div style={{ flex: 1, padding: "20px 24px", overflowY: "auto", minHeight: 0 }}>
                <AnimatePresence mode="wait">
                  {step && (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 16,
                          marginBottom: 24,
                        }}
                      >
                        <div
                          style={{
                            width: 64,
                            height: 64,
                            borderRadius: 16,
                            background: `${step.color}15`,
                            border: `2px solid ${step.color}40`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Icon size={32} style={{ color: step.color }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <h3
                            style={{
                              color: "#fff",
                              fontSize: 18,
                              fontWeight: 700,
                              margin: "0 0 8px 0",
                            }}
                          >
                            {step.title}
                          </h3>
                          <p
                            style={{
                              color: "#94a3b8",
                              fontSize: 14,
                              lineHeight: 1.6,
                              margin: 0,
                            }}
                          >
                            {step.description}
                          </p>
                        </div>
                      </div>

                      {/* Data Display */}
                      <div
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: 16,
                          padding: 20,
                        }}
                      >
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, 1fr)",
                            gap: 16,
                          }}
                        >
                          {Object.entries(step.data).map(([key, value]) => (
                            <div key={key}>
                              <p
                                style={{
                                  color: "#64748b",
                                  fontSize: 11,
                                  textTransform: "uppercase",
                                  margin: "0 0 6px 0",
                                }}
                              >
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </p>
                              <p
                                style={{
                                  color: "#fff",
                                  fontSize: 14,
                                  fontWeight: 600,
                                  margin: 0,
                                }}
                              >
                                {Array.isArray(value)
                                  ? value.join(", ")
                                  : value}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {isPlaying && currentStep < DEMO_STEPS.length && (
                        <div style={{ marginTop: 24 }}>
                          <div
                            style={{
                              height: 4,
                              background: "rgba(255,255,255,0.05)",
                              borderRadius: 2,
                              overflow: "hidden",
                            }}
                          >
                            <motion.div
                              style={{
                                height: "100%",
                                background: step.color,
                                width: `${progress}%`,
                                borderRadius: 2,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Completion */}
                {currentStep >= DEMO_STEPS.length && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ textAlign: "center", padding: "40px 20px" }}
                  >
                    <div
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        background: "rgba(34,197,94,0.15)",
                        border: "2px solid rgba(34,197,94,0.4)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 20px",
                      }}
                    >
                      <ShieldCheck size={40} style={{ color: "#22c55e" }} />
                    </div>
                    <h3
                      style={{
                        color: "#fff",
                        fontSize: 20,
                        fontWeight: 700,
                        marginBottom: 12,
                      }}
                    >
                      Demo Complete!
                    </h3>
                    <p
                      style={{
                        color: "#94a3b8",
                        fontSize: 14,
                        maxWidth: 400,
                        margin: "0 auto 24px",
                      }}
                    >
                      This is how FraudWatch AI protects your organization 24/7
                      by detecting, analyzing, and preventing internal fraud in
                      real-time.
                    </p>
                    <button
                      onClick={resetDemo}
                      style={{
                        padding: "12px 24px",
                        borderRadius: 12,
                        background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                        border: "none",
                        color: "#fff",
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Play size={16} /> Watch Again
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Footer Controls */}
              {currentStep < DEMO_STEPS.length && (
                <div
                  style={{
                    padding: "16px 24px",
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.02)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <button
                    onClick={resetDemo}
                    style={{
                      padding: "10px 16px",
                      borderRadius: 10,
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#94a3b8",
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    Reset
                  </button>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      style={{
                        padding: "10px 20px",
                        borderRadius: 10,
                        background: isPlaying
                          ? "rgba(239,68,68,0.15)"
                          : "rgba(34,197,94,0.15)",
                        border: isPlaying
                          ? "1px solid rgba(239,68,68,0.3)"
                          : "1px solid rgba(34,197,94,0.3)",
                        color: isPlaying ? "#f87171" : "#22c55e",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {isPlaying ? "Pause" : "Play"}
                    </button>
                    <button
                      onClick={() => {
                        if (currentStep < DEMO_STEPS.length - 1) {
                          setCurrentStep((s) => s + 1);
                          setProgress(0);
                        }
                      }}
                      disabled={currentStep >= DEMO_STEPS.length - 1}
                      style={{
                        padding: "10px 20px",
                        borderRadius: 10,
                        background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                        border: "none",
                        color: "#fff",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor:
                          currentStep >= DEMO_STEPS.length - 1
                            ? "not-allowed"
                            : "pointer",
                        opacity: currentStep >= DEMO_STEPS.length - 1 ? 0.5 : 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      Next <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
