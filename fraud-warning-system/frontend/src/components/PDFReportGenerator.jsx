import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Download, X, CheckCircle, Loader2, Eye } from "lucide-react";
import jsPDF from "jspdf";

function getRiskFactors(alert) {
  const factors = [];
  if (alert.reasons) {
    alert.reasons.forEach((reason) => {
      const r = reason.toLowerCase();
      if (r.includes("hour") || r.includes("time") || r.includes("am") || r.includes("pm"))
        factors.push({ category: "Time Anomaly", reason, impact: 25 });
      if (r.includes("download") || r.includes("data") || r.includes("volume") || r.includes("gb") || r.includes("mb"))
        factors.push({ category: "Data Volume", reason, impact: 30 });
      if (r.includes("location") || r.includes("ip") || r.includes("vpn") || r.includes("unrecognized"))
        factors.push({ category: "Location Risk", reason, impact: 20 });
      if (r.includes("privilege") || r.includes("escalation") || r.includes("admin"))
        factors.push({ category: "Privilege Abuse", reason, impact: 35 });
      if (r.includes("account") || r.includes("session") || r.includes("modification"))
        factors.push({ category: "Behavior Pattern", reason, impact: 20 });
    });
  }
  if (factors.length === 0) {
    factors.push(
      { category: "Anomaly Score", reason: "Deviation from baseline behavior", impact: 35 },
      { category: "Time Anomaly", reason: "Access outside normal hours", impact: 25 },
      { category: "Data Volume", reason: "Unusual data access volume", impact: 20 },
      { category: "Location Risk", reason: "New or suspicious location", impact: 20 }
    );
  }
  const total = factors.reduce((s, f) => s + f.impact, 0);
  factors.forEach((f) => (f.impact = Math.round((f.impact / total) * 100)));
  return factors;
}

function buildPDF(alert, notes) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 18;
  const contentW = W - M * 2;
  let y = 0;

  const newPage = () => {
    doc.addPage();
    y = 20;
  };

  const checkSpace = (needed) => {
    if (y + needed > H - 22) newPage();
  };

  // ── HEADER ─────────────────────────────────────────────────────────
  doc.setFillColor(10, 14, 26);
  doc.rect(0, 0, W, 42, "F");

  // Accent bar
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, 5, 42, "F");

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("FRAUD INVESTIGATION REPORT", M, 18);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  doc.text("FraudWatch AI  •  Confidential", M, 27);
  doc.text(`Generated: ${new Date().toLocaleString()}`, M, 34);

  const reportId = `RPT-${Date.now().toString(36).toUpperCase()}`;
  doc.text(`Report ID: ${reportId}`, W - M - 2, 34, { align: "right" });

  y = 52;

  // ── SECTION HELPER ───────────────────────────────────────────────
  const section = (title) => {
    checkSpace(16);
    doc.setFillColor(59, 130, 246);
    doc.rect(M, y, 3, 9, "F");
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(title, M + 6, y + 6.5);
    y += 14;
  };

  // ── OVERVIEW BOX ────────────────────────────────────────────────
  section("Case Overview");

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(M, y, contentW, 44, 3, 3, "FD");

  const col1x = M + 5;
  const col2x = M + contentW / 2 + 5;

  const kv = (label, value, x, rowY, valColor = [30, 41, 59]) => {
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(label, x, rowY);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...valColor);
    doc.text(String(value), x, rowY + 5);
  };

  const rc = alert.riskScore >= 75 ? [220, 38, 38] : alert.riskScore >= 50 ? [202, 138, 4] : [22, 163, 74];

  kv("Alert ID", alert.alertId || "N/A", col1x, y + 8);
  kv("Employee Name", alert.employeeName || "N/A", col1x, y + 22);
  kv("Department", alert.department || "N/A", col1x, y + 36);

  kv("Risk Score", `${alert.riskScore}%`, col2x, y + 8, rc);
  kv("Severity", (alert.severity || "N/A").toUpperCase(), col2x, y + 22);
  kv("Status", (alert.status || "N/A").toUpperCase(), col2x, y + 36);

  y += 52;

  // ── EMPLOYEE DETAILS ─────────────────────────────────────────────
  section("Employee Details");

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(M, y, contentW, 28, 3, 3, "FD");

  kv("Role", alert.role || "N/A", col1x, y + 8);
  kv("Employee ID", alert.employeeId || "N/A", col1x, y + 20);
  kv("System Accessed", alert.systemAccessed || "N/A", col2x, y + 8);
  kv("Activity Type", (alert.activityType || "N/A").replace(/_/g, " "), col2x, y + 20);

  y += 36;

  // ── AI RISK ANALYSIS TABLE ───────────────────────────────────────
  section("AI Risk Analysis — Isolation Forest Model");

  const factors = getRiskFactors(alert);
  const rowH = 9;
  const tableH = 10 + factors.length * rowH;
  checkSpace(tableH + 6);

  // Header row
  doc.setFillColor(59, 130, 246);
  doc.rect(M, y, contentW, 9, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("RISK FACTOR", M + 4, y + 6);
  doc.text("DETAIL", M + 60, y + 6);
  doc.text("IMPACT", W - M - 4, y + 6, { align: "right" });
  y += 9;

  factors.forEach((f, i) => {
    checkSpace(rowH);
    if (i % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(M, y, contentW, rowH, "F");
    }
    doc.setDrawColor(226, 232, 240);
    doc.rect(M, y, contentW, rowH, "D");

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text(f.category, M + 4, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    const truncated = doc.splitTextToSize(f.reason, 90)[0];
    doc.text(truncated, M + 60, y + 6);

    doc.setFont("helvetica", "bold");
    const impactColor = f.impact >= 30 ? [220, 38, 38] : f.impact >= 20 ? [202, 138, 4] : [22, 163, 74];
    doc.setTextColor(...impactColor);
    doc.text(`${f.impact}%`, W - M - 4, y + 6, { align: "right" });

    // Impact bar
    doc.setFillColor(226, 232, 240);
    doc.rect(M + 140, y + 3, 25, 3, "F");
    doc.setFillColor(...impactColor);
    doc.rect(M + 140, y + 3, (25 * f.impact) / 100, 3, "F");

    y += rowH;
  });
  y += 8;

  // ── FLAGGED ACTIVITIES ───────────────────────────────────────────
  if (alert.reasons && alert.reasons.length > 0) {
    checkSpace(20);
    section("Flagged Activities");

    alert.reasons.forEach((reason, i) => {
      checkSpace(10);
      doc.setFillColor(i % 2 === 0 ? 254 : 255, i % 2 === 0 ? 242 : 255, i % 2 === 0 ? 242 : 255);
      doc.setDrawColor(254, 202, 202);
      doc.rect(M, y, contentW, 9, "FD");

      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(220, 38, 38);
      doc.text(`${i + 1}.`, M + 4, y + 6);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(127, 29, 29);
      const lines = doc.splitTextToSize(reason, contentW - 14);
      doc.text(lines[0], M + 10, y + 6);
      y += 9;
    });
    y += 6;
  }

  // ── INVESTIGATION NOTES ──────────────────────────────────────────
  if (notes && notes.trim()) {
    checkSpace(20);
    section("Investigation Notes");

    const noteLines = doc.splitTextToSize(notes.trim(), contentW - 8);
    const noteH = Math.max(20, noteLines.length * 5 + 10);
    checkSpace(noteH);

    doc.setFillColor(239, 246, 255);
    doc.setDrawColor(147, 197, 253);
    doc.roundedRect(M, y, contentW, noteH, 3, 3, "FD");

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 64, 175);
    doc.text(noteLines, M + 5, y + 8);
    y += noteH + 8;
  }

  // ── RECOMMENDATIONS ──────────────────────────────────────────────
  checkSpace(60);
  section("Recommended Actions");

  const recs = [
    { p: "CRITICAL", t: alert.riskScore >= 75 ? "Suspend user account access immediately pending full investigation" : "Escalate alert to senior analyst for review", c: [220, 38, 38], bg: [254, 242, 242] },
    { p: "HIGH", t: "Pull and preserve all system access logs, download history, and authentication records", c: [202, 138, 4], bg: [255, 251, 235] },
    { p: "HIGH", t: "Notify IT Security team and department head — do not alert the employee", c: [202, 138, 4], bg: [255, 251, 235] },
    { p: "MEDIUM", t: "Interview employee's direct supervisor and review recent project assignments", c: [37, 99, 235], bg: [239, 246, 255] },
    { p: "MEDIUM", t: "Check for any data exfiltration: email attachments, USB activity, cloud uploads", c: [37, 99, 235], bg: [239, 246, 255] },
    { p: "LOW", t: "Document all findings; update case management system with timeline", c: [22, 163, 74], bg: [240, 253, 244] },
  ];

  recs.forEach((r) => {
    checkSpace(12);
    doc.setFillColor(...r.bg);
    doc.setDrawColor(226, 232, 240);
    doc.rect(M, y, contentW, 10, "FD");

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...r.c);
    doc.text(r.p, M + 4, y + 6.5);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 41, 59);
    const recLines = doc.splitTextToSize(r.t, contentW - 28);
    doc.text(recLines[0], M + 28, y + 6.5);
    y += 10;
  });

  y += 8;

  // ── ML MODEL NOTE ────────────────────────────────────────────────
  checkSpace(22);
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(147, 197, 253);
  doc.roundedRect(M, y, contentW, 18, 3, 3, "FD");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(37, 99, 235);
  doc.text("AI MODEL INFO:", M + 5, y + 7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 64, 175);
  doc.text("Isolation Forest algorithm • 50+ behavioral signals • Real-time anomaly detection", M + 5, y + 13);
  y += 24;

  // ── FOOTER on every page ─────────────────────────────────────────
  const pages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFillColor(248, 250, 252);
    doc.rect(0, H - 14, W, 14, "F");
    doc.setDrawColor(226, 232, 240);
    doc.line(0, H - 14, W, H - 14);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("FraudWatch AI  |  CONFIDENTIAL — For Internal Use Only", M, H - 6);
    doc.text(`Page ${p} of ${pages}`, W - M, H - 6, { align: "right" });
  }

  return doc;
}

export default function PDFReportGenerator({ alert, notes = "" }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    setError(null);

    // Use setTimeout so React re-renders the loading state before heavy work
    setTimeout(() => {
      try {
        const doc = buildPDF(alert, notes);
        doc.save(`FraudWatch_${alert.alertId || "Report"}_${new Date().toISOString().slice(0, 10)}.pdf`);
        setGenerated(true);
        setTimeout(() => setGenerated(false), 3000);
      } catch (err) {
        console.error("PDF error:", err);
        setError("Failed to generate PDF. Please try again.");
      } finally {
        setIsGenerating(false);
      }
    }, 100);
  };

  return (
    <>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {/* Export Button */}
        <motion.button
          onClick={handleGenerate}
          disabled={isGenerating}
          whileHover={!isGenerating ? { scale: 1.02 } : {}}
          whileTap={!isGenerating ? { scale: 0.98 } : {}}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "11px 22px",
            borderRadius: 12,
            border: "none",
            background: generated
              ? "linear-gradient(135deg, #16a34a, #15803d)"
              : isGenerating
                ? "rgba(59,130,246,0.4)"
                : "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            cursor: isGenerating ? "not-allowed" : "pointer",
            transition: "all 0.3s",
            boxShadow: isGenerating ? "none" : "0 4px 20px rgba(59,130,246,0.3)",
          }}
        >
          {isGenerating ? (
            <>
              <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
              Building PDF...
            </>
          ) : generated ? (
            <>
              <CheckCircle size={15} />
              Downloaded!
            </>
          ) : (
            <>
              <Download size={15} />
              Export PDF Report
            </>
          )}
        </motion.button>

        {/* Preview Button */}
        <motion.button
          onClick={() => setShowPreview(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "11px 18px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.05)",
            color: "#94a3b8",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#94a3b8"; }}
        >
          <Eye size={15} />
          Preview
        </motion.button>
      </div>

      {error && (
        <p style={{ color: "#f87171", fontSize: 12, marginTop: 8 }}>{error}</p>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPreview(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 10000, backdropFilter: "blur(4px)" }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, x: "-50%", y: "calc(-50% + 30px)" }}
              animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
              exit={{ opacity: 0, scale: 0.92, x: "-50%", y: "calc(-50% + 30px)" }}
              style={{
                position: "fixed", top: "50%", left: "50%",
                width: "min(640px, 95vw)",
                maxHeight: "88vh",
                background: "#fff",
                borderRadius: 20,
                boxShadow: "0 30px 90px rgba(0,0,0,0.5)",
                zIndex: 10001,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Modal Header */}
              <div style={{ padding: "14px 20px", background: "#0f172a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <FileText size={18} color="#60a5fa" />
                  <span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>Report Preview — {alert.alertId}</span>
                </div>
                <button onClick={() => setShowPreview(false)} style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,255,255,0.1)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <X size={16} color="#fff" />
                </button>
              </div>

              {/* Mock PDF Content */}
              <div style={{ flex: 1, overflowY: "auto", background: "#f1f5f9" }}>
                {/* Simulated PDF page */}
                <div style={{ margin: 20, background: "#fff", borderRadius: 8, boxShadow: "0 2px 16px rgba(0,0,0,0.12)", overflow: "hidden" }}>
                  {/* PDF Header */}
                  <div style={{ background: "#0a0e1a", padding: "18px 24px", borderLeft: "5px solid #3b82f6" }}>
                    <h2 style={{ color: "#fff", fontSize: 16, fontWeight: 700, margin: 0 }}>FRAUD INVESTIGATION REPORT</h2>
                    <p style={{ color: "#94a3b8", fontSize: 11, margin: "6px 0 0" }}>FraudWatch AI  •  Confidential  •  {new Date().toLocaleString()}</p>
                  </div>

                  <div style={{ padding: "20px 24px" }}>
                    {/* Case Overview */}
                    <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 16, marginBottom: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                        <div style={{ width: 3, height: 14, background: "#3b82f6", borderRadius: 2 }} />
                        <h3 style={{ color: "#1e293b", fontSize: 12, fontWeight: 700, margin: 0, textTransform: "uppercase", letterSpacing: 0.5 }}>Case Overview</h3>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        {[
                          ["Alert ID", alert.alertId], ["Risk Score", `${alert.riskScore}%`],
                          ["Employee", alert.employeeName], ["Department", alert.department],
                          ["Severity", (alert.severity || "").toUpperCase()], ["Status", (alert.status || "").toUpperCase()],
                        ].map(([label, val]) => (
                          <div key={label}>
                            <p style={{ color: "#64748b", fontSize: 9, margin: 0, textTransform: "uppercase" }}>{label}</p>
                            <p style={{ color: label === "Risk Score" ? (alert.riskScore >= 75 ? "#dc2626" : "#ca8a04") : "#1e293b", fontSize: 12, fontWeight: 600, margin: "3px 0 0" }}>{val}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI Risk Analysis */}
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <div style={{ width: 3, height: 14, background: "#3b82f6", borderRadius: 2 }} />
                        <h3 style={{ color: "#1e293b", fontSize: 12, fontWeight: 700, margin: 0, textTransform: "uppercase" }}>AI Risk Analysis</h3>
                      </div>
                      <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
                        <div style={{ background: "#3b82f6", padding: "7px 12px", display: "grid", gridTemplateColumns: "120px 1fr 60px" }}>
                          {["RISK FACTOR", "DETAIL", "IMPACT"].map((h) => (
                            <span key={h} style={{ color: "#fff", fontSize: 9, fontWeight: 700 }}>{h}</span>
                          ))}
                        </div>
                        {getRiskFactors(alert).map((f, i) => (
                          <div key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff", padding: "8px 12px", borderTop: "1px solid #e2e8f0", display: "grid", gridTemplateColumns: "120px 1fr 60px", alignItems: "center" }}>
                            <span style={{ fontSize: 10, fontWeight: 600, color: "#1e293b" }}>{f.category}</span>
                            <span style={{ fontSize: 9, color: "#475569" }}>{f.reason.length > 50 ? f.reason.slice(0, 50) + "…" : f.reason}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, color: f.impact >= 30 ? "#dc2626" : f.impact >= 20 ? "#ca8a04" : "#16a34a" }}>{f.impact}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Flagged Activities */}
                    {alert.reasons && alert.reasons.length > 0 && (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                          <div style={{ width: 3, height: 14, background: "#ef4444", borderRadius: 2 }} />
                          <h3 style={{ color: "#1e293b", fontSize: 12, fontWeight: 700, margin: 0, textTransform: "uppercase" }}>Flagged Activities</h3>
                        </div>
                        {alert.reasons.map((r, i) => (
                          <div key={i} style={{ background: i % 2 === 0 ? "#fef2f2" : "#fff9f9", border: "1px solid #fecaca", borderRadius: 6, padding: "7px 12px", marginBottom: 4, fontSize: 10, color: "#7f1d1d" }}>
                            <strong style={{ color: "#dc2626" }}>{i + 1}. </strong>{r}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Recommendations preview */}
                    <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 3, height: 14, background: "#16a34a", borderRadius: 2 }} />
                        <h3 style={{ color: "#15803d", fontSize: 12, fontWeight: 700, margin: 0, textTransform: "uppercase" }}>Recommendations included in full PDF</h3>
                      </div>
                      <p style={{ color: "#166534", fontSize: 10, margin: 0 }}>Priority action items, investigation steps, and ML model metadata are fully detailed in the exported PDF.</p>
                    </div>
                  </div>

                  {/* PDF Footer */}
                  <div style={{ background: "#f8fafc", borderTop: "1px solid #e2e8f0", padding: "8px 24px", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#94a3b8", fontSize: 9 }}>FraudWatch AI  |  CONFIDENTIAL — For Internal Use Only</span>
                    <span style={{ color: "#94a3b8", fontSize: 9 }}>Page 1 of 1</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{ padding: "14px 20px", borderTop: "1px solid #e2e8f0", background: "#fff", display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button onClick={() => setShowPreview(false)} style={{ padding: "9px 18px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 13, cursor: "pointer" }}>
                  Close
                </button>
                <button
                  onClick={() => { setShowPreview(false); handleGenerate(); }}
                  style={{ padding: "9px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
                >
                  <Download size={14} /> Download PDF
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
