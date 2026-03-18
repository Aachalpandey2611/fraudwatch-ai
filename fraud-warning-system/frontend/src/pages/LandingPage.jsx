import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useAnimation,
  AnimatePresence,
} from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  AlertTriangle,
  Brain,
  FileText,
  TrendingUp,
  Eye,
  Users,
  Lock,
  Zap,
  ChevronRight,
  Activity,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Globe,
  Clock,
  DollarSign,
} from "lucide-react";

/* ── tiny helpers ─────────────────────────────────────────────────── */
function useCountUp(target, duration = 2000, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const pct = Math.min((ts - startTime) / duration, 1);
      setVal(Math.floor(pct * target));
      if (pct < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return val;
}

function AnimSection({ children, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ── stat card (with count-up) ───────────────────────────────────── */
function StatCard({ icon: Icon, value, suffix, label, color, delay }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const count = useCountUp(value, 1800, inView);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ delay, duration: 0.6, ease: "backOut" }}
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${color}30`,
        borderRadius: 20,
        padding: "28px 24px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 50% 0%, ${color}10, transparent 70%)`,
        }}
      />
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: `${color}20`,
          border: `1px solid ${color}40`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
        }}
      >
        <Icon size={22} style={{ color }} />
      </div>
      <div
        style={{ fontSize: 40, fontWeight: 800, color: "#fff", lineHeight: 1 }}
      >
        {count}
        {suffix}
      </div>
      <div
        style={{
          color: "#64748b",
          fontSize: 13,
          marginTop: 8,
          fontWeight: 500,
        }}
      >
        {label}
      </div>
    </motion.div>
  );
}

/* ── feature card ─────────────────────────────────────────────────── */
function FeatureCard({ icon: Icon, title, desc, color, delay }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov
          ? `linear-gradient(135deg, ${color}10, rgba(255,255,255,0.04))`
          : "rgba(255,255,255,0.02)",
        border: `1px solid ${hov ? color + "50" : "rgba(255,255,255,0.07)"}`,
        borderRadius: 20,
        padding: "28px",
        cursor: "default",
        transition: "all 0.3s",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <motion.div
        animate={{ scale: hov ? 1.08 : 1 }}
        transition={{ duration: 0.3 }}
        style={{
          width: 52,
          height: 52,
          borderRadius: 16,
          background: `${color}20`,
          border: `1px solid ${color}40`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 18,
        }}
      >
        <Icon size={24} style={{ color }} />
      </motion.div>
      <h3
        style={{
          color: "#fff",
          fontSize: 17,
          fontWeight: 700,
          marginBottom: 10,
        }}
      >
        {title}
      </h3>
      <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.65 }}>{desc}</p>
    </motion.div>
  );
}

/* ── floating orbs (background decoration) ───────────────────────── */
function Orbs() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {[
        {
          w: 600,
          h: 600,
          left: "-15%",
          top: "-10%",
          color: "rgba(59,130,246,0.12)",
        },
        {
          w: 500,
          h: 500,
          right: "-10%",
          top: "20%",
          color: "rgba(139,92,246,0.10)",
        },
        {
          w: 400,
          h: 400,
          left: "30%",
          bottom: "5%",
          color: "rgba(239,68,68,0.07)",
        },
      ].map((o, i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            width: o.w,
            height: o.h,
            ...o,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${o.color}, transparent 70%)`,
            filter: "blur(40px)",
          }}
        />
      ))}
    </div>
  );
}

/* ── grid dots background ─────────────────────────────────────────── */
function GridOverlay() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        backgroundImage: `radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
      }}
    />
  );
}

/* ── scanning line animation ─────────────────────────────────────── */
function ScanLine() {
  return (
    <motion.div
      animate={{ top: ["10%", "90%", "10%"] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        height: 2,
        background:
          "linear-gradient(90deg, transparent, rgba(59,130,246,0.6), transparent)",
        pointerEvents: "none",
      }}
    />
  );
}

/* ── ALERT TICKER ─────────────────────────────────────────────────── */
const ALERTS = [
  "🔴  CRITICAL: Bulk data exfiltration detected — User EMP-2341",
  "🟠  HIGH: Privilege escalation attempt — Finance dept",
  "🔴  CRITICAL: 47 GB download in 3 min — ML flagged",
  "🟡  MEDIUM: Unusual login from unrecognized IP — HR dept",
  "🔴  CRITICAL: Account takeover attempt — blocked by AI",
];
function AlertTicker() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % ALERTS.length), 3000);
    return () => clearInterval(t);
  }, []);
  return (
    <div
      style={{
        background: "rgba(239,68,68,0.08)",
        border: "1px solid rgba(239,68,68,0.2)",
        borderRadius: 10,
        padding: "10px 20px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        overflow: "hidden",
        maxWidth: 620,
      }}
    >
      <Activity size={16} style={{ color: "#ef4444", flexShrink: 0 }} />
      <AnimatePresence mode="wait">
        <motion.span
          key={idx}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35 }}
          style={{
            color: "#fca5a5",
            fontSize: 13,
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          {ALERTS[idx]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  MAIN LANDING PAGE                                                  */
/* ═══════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const navigate = useNavigate();

  const STATS = [
    {
      icon: DollarSign,
      value: 42,
      suffix: "B+",
      label: "Lost to internal fraud yearly (global)",
      color: "#ef4444",
      delay: 0,
    },
    {
      icon: Users,
      value: 38,
      suffix: "%",
      label: "Of fraud committed by trusted employees",
      color: "#f97316",
      delay: 0.1,
    },
    {
      icon: Clock,
      value: 18,
      suffix: "mo",
      label: "Average time to detect insider fraud",
      color: "#eab308",
      delay: 0.2,
    },
    {
      icon: Globe,
      value: 95,
      suffix: "%",
      label: "Of attacks caught by FraudWatch AI",
      color: "#22c55e",
      delay: 0.3,
    },
  ];

  const FEATURES = [
    {
      icon: Brain,
      color: "#3b82f6",
      title: "AI / ML Anomaly Detection",
      desc: "Isolation Forest model analyzes 200+ behavioral signals in real-time to flag deviations from each employee's unique baseline.",
      delay: 0,
    },
    {
      icon: AlertTriangle,
      color: "#ef4444",
      title: "Insider Threat Intelligence",
      desc: "Detects privilege escalation, bulk data exfiltration, off-hours access, and account takeover attempts before damage occurs.",
      delay: 0.08,
    },
    {
      icon: Eye,
      color: "#8b5cf6",
      title: "Real-Time Activity Monitoring",
      desc: "Every file access, login, download, and permission change is logged and scored by risk level within milliseconds.",
      delay: 0.16,
    },
    {
      icon: BarChart3,
      color: "#22c55e",
      title: "Risk Score Dashboard",
      desc: "Executive-level visibility into department risk posture, top flagged employees, and anomaly trends over time.",
      delay: 0.24,
    },
    {
      icon: FileText,
      color: "#f97316",
      title: "Automated PDF Investigation Reports",
      desc: "One-click forensic reports with AI risk breakdown, flagged activities, evidence timeline, and recommended actions.",
      delay: 0.32,
    },
    {
      icon: Shield,
      color: "#06b6d4",
      title: "Role-Based Access Control",
      desc: "Admin, Analyst, and Investigator roles ensure only authorized personnel see sensitive case data.",
      delay: 0.4,
    },
  ];

  const HOW = [
    {
      n: "01",
      title: "Employee Activity Ingested",
      desc: "All logins, file accesses, downloads, and privilege changes are captured in real-time.",
      color: "#3b82f6",
    },
    {
      n: "02",
      title: "ML Baseline Established",
      desc: "The Isolation Forest model learns each employee's normal behavior pattern over 30 days.",
      color: "#8b5cf6",
    },
    {
      n: "03",
      title: "Anomaly Scored & Flagged",
      desc: "Deviations from baseline are scored 0–100. High-risk events trigger automated alerts.",
      color: "#ef4444",
    },
    {
      n: "04",
      title: "Investigation Assigned",
      desc: "Security analysts review the AI-explainable flag with full context and evidence.",
      color: "#f97316",
    },
    {
      n: "05",
      title: "Threat Contained & Reported",
      desc: "Accounts are locked, incidents documented, and PDF forensic reports auto-generated.",
      color: "#22c55e",
    },
  ];

  return (
    <div
      style={{
        background: "#0a0e1a",
        minHeight: "100vh",
        fontFamily: "system-ui, sans-serif",
        color: "#fff",
        overflowX: "hidden",
      }}
    >
      {/* ── NAV ──────────────────────────────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 48px",
          background: "rgba(10,14,26,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Shield size={18} color="#fff" />
          </div>
          <span
            style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em" }}
          >
            FraudWatch <span style={{ color: "#60a5fa" }}>AI</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => navigate("/admin/login")}
            style={{
              padding: "9px 22px",
              borderRadius: 10,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#cbd5e1",
              fontSize: 14,
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Sign In
          </button>
           {/* ✅ ADD THIS (Employee Login) */}
  <button
    onClick={() => navigate("/employee/login")}
    style={{
      padding: "9px 22px",
      borderRadius: 10,
      background: "rgba(34,197,94,0.2)",
      border: "1px solid rgba(34,197,94,0.4)",
      color: "#22c55e",
      fontSize: 14,
      cursor: "pointer",
      fontWeight: 600,
    }}
  >
    Employee Login
  </button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/admin/login")}
            style={{
              padding: "9px 22px",
              borderRadius: 10,
              background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
              border: "none",
              color: "#fff",
              fontSize: 14,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Get Started →
          </motion.button>
        </div>
      </motion.nav>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "120px 24px 80px",
          textAlign: "center",
        }}
      >
        <Orbs />
        <GridOverlay />
        <ScanLine />

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "7px 18px",
            borderRadius: 100,
            background: "rgba(59,130,246,0.12)",
            border: "1px solid rgba(59,130,246,0.3)",
            marginBottom: 28,
            fontSize: 13,
            color: "#60a5fa",
            fontWeight: 600,
          }}
        >
          <Zap size={14} fill="#60a5fa" /> Hackathon 2025 — Internal Fraud
          Detection System
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontSize: "clamp(36px, 6vw, 76px)",
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            marginBottom: 24,
            maxWidth: 900,
          }}
        >
          Stop Internal Fraud{" "}
          <span
            style={{
              background: "linear-gradient(135deg,#3b82f6,#8b5cf6,#ec4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Before It Starts
          </span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            fontSize: 18,
            color: "#94a3b8",
            maxWidth: 620,
            lineHeight: 1.7,
            marginBottom: 40,
          }}
        >
          FraudWatch AI uses Isolation Forest machine learning to detect insider
          threats, data exfiltration, privilege abuse, and anomalous behavior —
          in real-time, 24/7.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          style={{
            display: "flex",
            gap: 14,
            flexWrap: "wrap",
            justifyContent: "center",
            marginBottom: 48,
          }}
        >
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 8px 40px rgba(59,130,246,0.5)",
            }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/admin/login")}
            style={{
              padding: "14px 32px",
              borderRadius: 14,
              background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
              border: "none",
              color: "#fff",
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            Launch Dashboard <ArrowRight size={18} />
          </motion.button>
          
  {/* ✅ 2️⃣ (Employee Button) */}
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.97 }}
    onClick={() => navigate("/employee/login")}
    style={{
      padding: "14px 32px",
      borderRadius: 14,
      background: "rgba(34,197,94,0.15)",
      border: "1px solid rgba(34,197,94,0.4)",
      color: "#22c55e",
      fontSize: 16,
      fontWeight: 700,
      cursor: "pointer",
    }}
  >
    Employee Portal
  </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() =>
              document
                .getElementById("how-it-works")
                .scrollIntoView({ behavior: "smooth" })
            }
            style={{
              padding: "14px 32px",
              borderRadius: 14,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#cbd5e1",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            How It Works
          </motion.button>
        </motion.div>

        {/* Live alert ticker */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <AlertTicker />
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          style={{
            position: "absolute",
            bottom: 32,
            left: "50%",
            transform: "translateX(-50%)",
            color: "#334155",
            fontSize: 12,
          }}
        >
          ↓ scroll
        </motion.div>
      </section>

      {/* ── PROBLEM STATEMENT ────────────────────────────────────────── */}
      <section
        style={{ padding: "100px 24px", maxWidth: 1100, margin: "0 auto" }}
      >
        <AnimSection>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 16px",
                borderRadius: 100,
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
                marginBottom: 20,
                fontSize: 12,
                color: "#f87171",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              <AlertTriangle size={12} /> The Problem
            </div>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 48px)",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                marginBottom: 16,
              }}
            >
              Insider Fraud is the{" "}
              <span style={{ color: "#ef4444" }}>Biggest Threat</span> You're
              Not Seeing
            </h2>
            <p
              style={{
                color: "#64748b",
                fontSize: 16,
                maxWidth: 640,
                margin: "0 auto",
                lineHeight: 1.7,
              }}
            >
              Traditional security focuses on external attackers. But the most
              damaging breaches come from within — trusted employees with
              legitimate access who exploit that trust for personal gain.
            </p>
          </div>
        </AnimSection>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 20,
          }}
        >
          {STATS.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        {/* Problem details */}
        <AnimSection delay={0.2}>
          <div
            style={{
              marginTop: 60,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 20,
            }}
          >
            {[
              {
                icon: Lock,
                color: "#ef4444",
                title: "Privilege Misuse",
                desc: "Employees with elevated access silently extract sensitive data or modify records to cover financial fraud.",
              },
              {
                icon: TrendingUp,
                color: "#f97316",
                title: "Slow, Invisible Attacks",
                desc: "Insider fraud unfolds over months. By the time it's noticed manually, millions are already lost.",
              },
              {
                icon: Users,
                color: "#8b5cf6",
                title: "No Behavioral Baseline",
                desc: "Without ML, security teams can't distinguish normal activity from the subtle patterns of insider threats.",
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 16,
                  padding: "24px",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: `${item.color}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 14,
                  }}
                >
                  <item.icon size={20} style={{ color: item.color }} />
                </div>
                <h3
                  style={{
                    color: "#fff",
                    fontSize: 16,
                    fontWeight: 700,
                    marginBottom: 8,
                  }}
                >
                  {item.title}
                </h3>
                <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.6 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </AnimSection>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        style={{
          padding: "100px 24px",
          background: "rgba(255,255,255,0.015)",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <AnimSection>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 16px",
                  borderRadius: 100,
                  background: "rgba(59,130,246,0.1)",
                  border: "1px solid rgba(59,130,246,0.2)",
                  marginBottom: 20,
                  fontSize: 12,
                  color: "#60a5fa",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                <Zap size={12} /> How It Works
              </div>
              <h2
                style={{
                  fontSize: "clamp(28px, 4vw, 48px)",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                }}
              >
                From Raw Activity to{" "}
                <span style={{ color: "#60a5fa" }}>Contained Threat</span>
              </h2>
            </div>
          </AnimSection>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {HOW.map((step, i) => (
              <AnimSection key={step.n} delay={i * 0.1}>
                <div
                  style={{
                    display: "flex",
                    gap: 24,
                    alignItems: "flex-start",
                    paddingBottom: i < HOW.length - 1 ? 0 : 0,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 16,
                        background: `${step.color}20`,
                        border: `2px solid ${step.color}50`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          color: step.color,
                          fontSize: 14,
                          fontWeight: 800,
                        }}
                      >
                        {step.n}
                      </span>
                    </div>
                    {i < HOW.length - 1 && (
                      <div
                        style={{
                          width: 2,
                          height: 48,
                          background: `linear-gradient(180deg, ${step.color}40, transparent)`,
                          marginTop: 4,
                        }}
                      />
                    )}
                  </div>
                  <div
                    style={{
                      paddingTop: 12,
                      paddingBottom: i < HOW.length - 1 ? 32 : 0,
                    }}
                  >
                    <h3
                      style={{
                        color: "#fff",
                        fontSize: 17,
                        fontWeight: 700,
                        marginBottom: 8,
                      }}
                    >
                      {step.title}
                    </h3>
                    <p
                      style={{
                        color: "#64748b",
                        fontSize: 14,
                        lineHeight: 1.65,
                      }}
                    >
                      {step.desc}
                    </p>
                  </div>
                </div>
              </AnimSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────── */}
      <section
        style={{ padding: "100px 24px", maxWidth: 1100, margin: "0 auto" }}
      >
        <AnimSection>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 16px",
                borderRadius: 100,
                background: "rgba(139,92,246,0.1)",
                border: "1px solid rgba(139,92,246,0.2)",
                marginBottom: 20,
                fontSize: 12,
                color: "#a78bfa",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              <Shield size={12} /> Features
            </div>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 48px)",
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
            >
              Everything You Need to{" "}
              <span style={{ color: "#a78bfa" }}>Stop Fraud</span>
            </h2>
          </div>
        </AnimSection>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 20,
          }}
        >
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </section>

      {/* ── ROLES ────────────────────────────────────────────────────── */}
      <section
        style={{
          padding: "80px 24px",
          background: "rgba(255,255,255,0.015)",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <AnimSection>
            <h2
              style={{
                fontSize: "clamp(24px, 3vw, 38px)",
                fontWeight: 800,
                textAlign: "center",
                marginBottom: 12,
                letterSpacing: "-0.02em",
              }}
            >
              Built for Every Role
            </h2>
            <p
              style={{
                color: "#64748b",
                textAlign: "center",
                fontSize: 15,
                marginBottom: 48,
              }}
            >
              Three access levels, each with a specific mission.
            </p>
          </AnimSection>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 20,
            }}
          >
            {[
              {
                role: "Admin",
                color: "#3b82f6",
                pass: "Database user",
                perms: [
                  "Full dashboard access",
                  "All alerts & activities",
                  "Investigation management",
                  "Settings & user management",
                  "PDF report export",
                ],
              },
              {
                role: "Analyst",
                color: "#8b5cf6",
                pass: "Database user",
                perms: [
                  "Dashboard & risk charts",
                  "View & triage all alerts",
                  "Activity monitoring",
                  "Investigation notes",
                  "Export forensic reports",
                ],
              },
              {
                role: "Investigator",
                color: "#22c55e",
                pass: "Database user",
                perms: [
                  "Assigned cases only",
                  "Alert review",
                  "Deep-dive investigation",
                  "Add case notes",
                  "Evidence documentation",
                ],
              },
            ].map((r, i) => (
              <AnimSection key={r.role} delay={i * 0.1}>
                <div
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: `1px solid ${r.color}30`,
                    borderRadius: 20,
                    padding: "28px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        background: `${r.color}20`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 15,
                        fontWeight: 800,
                        color: r.color,
                      }}
                    >
                      {r.role[0]}
                    </div>
                    <div>
                      <div
                        style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}
                      >
                        {r.role}
                      </div>
                      <div
                        style={{
                          color: "#475569",
                          fontSize: 11,
                          fontFamily: "monospace",
                        }}
                      >
                        {r.pass}
                      </div>
                    </div>
                  </div>
                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                      margin: 0,
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    {r.perms.map((p) => (
                      <li
                        key={p}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          color: "#94a3b8",
                          fontSize: 13,
                        }}
                      >
                        <CheckCircle
                          size={14}
                          style={{ color: r.color, flexShrink: 0 }}
                        />{" "}
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FOOTER ───────────────────────────────────────────────── */}
      <section
        style={{
          padding: "120px 24px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at center, rgba(59,130,246,0.1) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <AnimSection>
          <motion.div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 24,
              padding: "10px 24px",
              borderRadius: 100,
              background: "rgba(59,130,246,0.12)",
              border: "1px solid rgba(59,130,246,0.25)",
            }}
          >
            <Shield size={18} style={{ color: "#60a5fa" }} />
            <span style={{ color: "#60a5fa", fontWeight: 700, fontSize: 15 }}>
              FraudWatch AI
            </span>
          </motion.div>
          <h2
            style={{
              fontSize: "clamp(30px, 5vw, 60px)",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              marginBottom: 20,
              lineHeight: 1.15,
            }}
          >
            Ready to Secure Your
            <br />
            <span
              style={{
                background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Organization?
            </span>
          </h2>
          <p
            style={{
              color: "#64748b",
              fontSize: 17,
              maxWidth: 500,
              margin: "0 auto 40px",
              lineHeight: 1.7,
            }}
          >
            Log in and explore live fraud detection with real records from your
            MongoDB database.
          </p>
          <motion.button
            whileHover={{
              scale: 1.06,
              boxShadow: "0 12px 50px rgba(59,130,246,0.55)",
            }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/admin/login")}
            style={{
              padding: "16px 40px",
              borderRadius: 16,
              background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
              border: "none",
              color: "#fff",
              fontSize: 17,
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            Enter Dashboard <ChevronRight size={20} />
          </motion.button>
        </AnimSection>
        <div style={{ marginTop: 60, color: "#1e293b", fontSize: 13 }}>
          © 2025 FraudWatch AI — Built for Hackathon 2025
        </div>
      </section>
    </div>
  );
}
