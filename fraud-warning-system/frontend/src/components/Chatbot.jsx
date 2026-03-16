import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import api from "../services/api";

const NO_DATA_MSG = "No data available from the database. Please ensure the backend and MongoDB are running.";

// ===== COMPREHENSIVE FRAUD KNOWLEDGE BASE =====
const FRAUD_KNOWLEDGE = {
  // DEFINITIONS
  definitions: {
    fraud: `**What is Fraud?**

Fraud is intentional deception to secure unfair or unlawful gain. In corporate settings, it includes:

• Financial manipulation or embezzlement
• Identity theft and impersonation
• Data theft and information selling
• Falsifying records or documents
• Unauthorized access to systems
• Kickbacks and bribery

Insider fraud is particularly dangerous as employees have legitimate access and knowledge of security gaps.`,

    insider_fraud: `**What is Insider Fraud?**

Insider fraud occurs when employees, contractors, or trusted individuals misuse their access to commit fraud.

**Types:**
• Data theft - stealing customer/company data
• Embezzlement - diverting company funds
• Intellectual property theft
• Sabotage - intentionally damaging systems
• Collusion - working with external fraudsters

**Warning Signs:**
• Unusual access patterns
• Working odd hours without reason
• Financial stress or lifestyle changes
• Resistance to audits or oversight
• Excessive access requests`,

    privilege_escalation: `**What is Privilege Escalation?**

Privilege escalation is when a user gains higher access rights than authorized, either through:

**Vertical Escalation:**
• Gaining admin/root access from regular user
• Bypassing access controls
• Exploiting software vulnerabilities

**Horizontal Escalation:**
• Accessing other users' accounts
• Viewing unauthorized data at same level

**Detection Indicators:**
• Unauthorized admin console access
• Unusual permission changes
• Access to restricted systems
• Multiple failed login attempts followed by success`,

    bulk_download: `**What is Bulk Download Fraud?**

Bulk downloading refers to extracting large volumes of data, often indicating:

• Data theft for sale or competitive advantage
• Preparation to leave company with data
• Industrial espionage
• Building unauthorized databases

**Red Flags:**
• Downloads exceeding normal job needs
• After-hours mass downloads
• Accessing records outside job scope
• Use of external storage devices
• Sending large files to personal email`,

    data_exfiltration: `**What is Data Exfiltration?**

Data exfiltration is unauthorized transfer of data outside the organization:

**Methods:**
• Email attachments to personal accounts
• Cloud storage uploads
• USB/external drives
• Screen captures
• Printing sensitive documents
• Encrypted channels

**High-Risk Data:**
• Customer PII (names, SSN, addresses)
• Financial records
• Trade secrets
• Authentication credentials
• Strategic business plans`,

    account_takeover: `**What is Account Takeover?**

Account takeover occurs when someone gains unauthorized access to another person's account:

**Techniques:**
• Credential stuffing (stolen passwords)
• Phishing attacks
• Social engineering
• Session hijacking
• SIM swapping

**Indicators:**
• Login from unusual locations
• Changed account settings
• Multiple device logins
• Password reset requests
• Unusual transaction patterns`,

    social_engineering: `**What is Social Engineering?**

Social engineering manipulates people into divulging confidential information:

**Common Tactics:**
• Phishing - fake emails/websites
• Pretexting - creating false scenarios
• Baiting - offering something enticing
• Tailgating - following into secure areas
• Quid pro quo - offering services for info

**Protection:**
• Verify caller/sender identity
• Never share credentials
• Report suspicious requests
• Use multi-factor authentication`,

    money_laundering: `**What is Money Laundering?**

Money laundering disguises illegal funds as legitimate:

**Three Stages:**
1. Placement - introducing illegal funds
2. Layering - complex transactions to hide trail
3. Integration - funds appear legitimate

**Red Flags:**
• Unusual transaction patterns
• Structuring (avoiding reporting thresholds)
• Round-dollar transactions
• Rapid movement between accounts
• Inconsistent business activity`,

    anomaly: `**What is an Anomaly in Fraud Detection?**

An anomaly is behavior that deviates significantly from normal patterns:

**Types We Monitor:**
• Access time anomalies (odd hours)
• Volume anomalies (unusual data amounts)
• Location anomalies (new locations)
• Behavioral anomalies (changed patterns)
• Transaction anomalies (unusual amounts)

**Our ML Model:**
Uses Isolation Forest algorithm to detect outliers based on historical behavior baselines.`,

    risk_score: `**What is a Risk Score?**

Risk score (0-100) quantifies the likelihood of fraudulent activity:

**Score Ranges:**
• 0-25: Low Risk (normal behavior)
• 26-50: Medium Risk (minor deviations)
• 51-75: High Risk (significant anomalies)
• 76-100: Critical Risk (immediate attention)

**Factors:**
• Time of access
• Data volume
• Location
• System accessed
• Historical patterns
• Role-based expectations`,
  },

  // PREVENTION TIPS
  prevention: {
    general: `**How to Prevent Internal Fraud**

**Organizational Controls:**
1. Implement least-privilege access
2. Segregation of duties
3. Regular access reviews
4. Mandatory vacations
5. Background checks

**Technical Controls:**
1. Multi-factor authentication
2. Data Loss Prevention (DLP) tools
3. Activity monitoring
4. Encryption
5. Regular audits

**Cultural Controls:**
1. Ethics training
2. Anonymous reporting hotlines
3. Clear policies
4. Lead by example
5. Reward integrity`,

    privilege_escalation: `**Preventing Privilege Escalation**

**Access Management:**
• Implement Role-Based Access Control (RBAC)
• Require approval for privilege changes
• Time-limit elevated access
• Regular access certification reviews

**Technical Measures:**
• Patch systems promptly
• Use Privileged Access Management (PAM)
• Monitor admin activities
• Implement just-in-time access
• Audit all permission changes

**Detection:**
• Alert on privilege changes
• Monitor failed access attempts
• Track admin console usage`,

    data_theft: `**Preventing Data Theft**

**Data Protection:**
• Classify data by sensitivity
• Encrypt sensitive data
• Implement DLP solutions
• Control USB/external media
• Monitor email attachments

**Access Controls:**
• Need-to-know basis access
• Regular access reviews
• Disable access immediately on termination
• Monitor bulk data access

**Employee Measures:**
• Security awareness training
• Clear data handling policies
• Exit interviews
• Non-disclosure agreements`,

    social_engineering: `**Preventing Social Engineering**

**Training:**
• Regular phishing simulations
• Security awareness programs
• Teach verification procedures
• Share real attack examples

**Procedures:**
• Verify identity before sharing info
• Callback verification for requests
• Clear escalation procedures
• Document unusual requests

**Technical:**
• Email filtering
• URL scanning
• Multi-factor authentication
• Caller ID verification`,

    account_security: `**Account Security Best Practices**

**Password Management:**
• Use strong, unique passwords
• Implement password managers
• Regular password rotation
• No password sharing

**Authentication:**
• Enable MFA everywhere
• Use hardware security keys
• Biometric authentication
• SSO with proper controls

**Monitoring:**
• Alert on suspicious logins
• Review active sessions
• Track authentication failures
• Geographic restrictions`,
  },

  // RECOVERY & NEXT STEPS
  recovery: {
    after_fraud: `**Steps After Discovering Fraud**

**Immediate Actions (First 24 Hours):**
1. Contain the incident - disable compromised accounts
2. Preserve evidence - don't delete logs
3. Document everything with timestamps
4. Notify incident response team
5. Assess scope of damage

**Investigation Phase:**
1. Forensic analysis of systems
2. Review all access logs
3. Interview relevant personnel
4. Identify all affected data/systems
5. Determine root cause

**Recovery Phase:**
1. Remediate vulnerabilities
2. Reset affected credentials
3. Notify affected parties if required
4. Implement additional controls
5. Update security policies`,

    data_breach: `**After a Data Breach**

**Containment:**
• Isolate affected systems
• Reset compromised credentials
• Block attacker access
• Preserve forensic evidence

**Assessment:**
• Determine what data was accessed
• Identify affected individuals
• Assess regulatory requirements
• Document timeline

**Notification:**
• Legal/compliance team
• Affected customers (if required)
• Regulatory bodies (GDPR, etc.)
• Law enforcement (if applicable)

**Remediation:**
• Patch vulnerabilities
• Enhance monitoring
• Offer credit monitoring to affected
• Review and update security controls`,

    account_compromise: `**After Account Compromise**

**Immediate Steps:**
1. Reset password immediately
2. Revoke all active sessions
3. Enable/verify MFA
4. Review recent account activity
5. Check for unauthorized changes

**Investigation:**
• Review login history
• Check email filters/forwards
• Audit permission changes
• Scan for malware

**Recovery:**
• Update security questions
• Review connected apps
• Notify IT security
• Monitor for follow-up attacks`,

    reporting: `**How to Report Fraud**

**Internal Reporting:**
• Contact your security team
• Use anonymous ethics hotline
• Email: security@company.com
• Document all observations

**What to Include:**
• Who: Persons involved
• What: Description of activity
• When: Dates and times
• Where: Systems/locations
• Evidence: Screenshots, logs

**External Reporting:**
• FBI IC3 (cyber crimes)
• FTC (consumer fraud)
• SEC (securities fraud)
• Local law enforcement

**Protection:**
Whistleblower protections exist - report without fear of retaliation.`,
  },

  // INVESTIGATION GUIDANCE
  investigation: {
    process: `**Fraud Investigation Process**

**Step 1: Initial Assessment**
• Review the alert details
• Check risk score and severity
• Identify the employee and their role
• Note the flagged activities

**Step 2: Gather Evidence**
• Pull complete activity logs
• Review access patterns
• Check historical behavior
• Document anomalies

**Step 3: Analysis**
• Compare to baseline behavior
• Look for patterns
• Identify all affected systems
• Assess data exposure

**Step 4: Determination**
• Confirmed fraud
• Policy violation
• False positive
• Needs more investigation

**Step 5: Action**
• Document findings
• Escalate if confirmed
• Update case notes
• Close or refer`,

    best_practices: `**Investigation Best Practices**

**Documentation:**
• Record all findings immediately
• Use screenshots with timestamps
• Maintain chain of custody
• Keep investigation confidential

**Analysis:**
• Be objective - avoid assumptions
• Follow the evidence
• Consider alternative explanations
• Consult with experts when needed

**Communication:**
• Need-to-know basis only
• Regular updates to stakeholders
• Clear, factual reporting
• Proper escalation channels

**Legal Considerations:**
• Preserve evidence properly
• Don't alert the suspect
• Work with legal/HR
• Follow company procedures`,
  },
};

// Dynamic data responses — use only live data from API
function getDynamicResponse(type, liveData) {
  const { stats = {}, alerts = [], activities = [] } = liveData || {};
  const hasData = (alerts.length > 0 || activities.length > 0 || (stats && (stats.totalEmployees != null || stats.totalAlerts != null)));
  if (!hasData) return NO_DATA_MSG;

  switch (type) {
    case "alerts_high": {
      const high = (alerts || []).filter((a) => a.severity === "critical" || a.severity === "high");
      return `Currently, there are ${high.length} high-priority alerts requiring immediate attention.\n\nMost Critical:\n${high.slice(0, 3).map((a) => `• ${a.employeeName || "—"} - ${(a.activityType || "").replace(/_/g, " ")} (Risk: ${a.riskScore || 0}%)`).join("\n")}`;
    }
    case "alerts_summary": {
      const bySev = { critical: 0, high: 0, medium: 0, low: 0 };
      (alerts || []).forEach((a) => { if (a.severity && bySev[a.severity] != null) bySev[a.severity]++; });
      const open = (alerts || []).filter((a) => a.status === "open").length;
      return `**Alert Summary**\n\n• Total Alerts: ${stats.totalAlerts ?? alerts.length}\n• Critical: ${bySev.critical}\n• High: ${bySev.high}\n• Medium: ${bySev.medium}\n• Low: ${bySev.low}\n\n${open} alerts are currently open.`;
    }
    case "employees_highrisk": {
      const byName = {};
      [...(alerts || []), ...(activities || [])].forEach((a) => {
        const name = a.employeeName;
        if (!name) return;
        const r = a.riskScore ?? a.risk ?? 0;
        if (!byName[name] || (byName[name].risk < r)) byName[name] = { name, dept: a.department || "", role: a.role || "", risk: r };
      });
      const highRisk = Object.values(byName).filter((e) => e.risk > 70);
      if (highRisk.length === 0) return "No high-risk employees in the current data.";
      return `**High-Risk Employees (Score > 70)**\n\n${highRisk.map((e) => `• ${e.name}\n  Department: ${e.dept}\n  Role: ${e.role}\n  Risk Score: ${e.risk}%`).join("\n\n")}`;
    }
    case "anomalies": {
      const anomalies = (activities || []).filter((a) => a.isAnomaly).slice(0, 4);
      const count = stats.anomaliesToday ?? anomalies.length;
      if (anomalies.length === 0) return `**Today's Anomalies: ${count}**\n\nNo recent anomalies in the data.`;
      return `**Today's Anomalies: ${count}**\n\nRecent Anomalies:\n${anomalies.map((a) => `• ${a.employeeName || "—"}\n  Action: ${(a.actionType || "").replace(/_/g, " ")}\n  System: ${a.systemAccessed || "—"}\n  Risk: ${a.riskScore || 0}%`).join("\n\n")}`;
    }
    case "status":
      return `**System Status: Operational**\n\n• Employees Monitored: ${stats.totalEmployees ?? 0}\n• Active Alerts: ${stats.totalAlerts ?? 0}\n• High Risk Users: ${stats.highRiskUsers ?? 0}\n• ML Model: Active (Isolation Forest)\n• Real-time Detection: Enabled\n• Last Scan: Just now`;
    default:
      return null;
  }
}

function getBotResponse(message, liveData) {
  const msg = message.toLowerCase();

  // Greetings
  if (msg.match(/^(hi|hello|hey|good morning|good afternoon|good evening)/)) {
    return "Hello! I'm FraudWatch AI Assistant. I can help you with:\n\n• Fraud definitions & explanations\n• Prevention strategies\n• Recovery steps after fraud\n• Alert analysis & investigation\n• System status & statistics\n\nWhat would you like to know?";
  }

  // Help
  if (msg.includes("help") || msg.includes("what can you") || msg.includes("how to use")) {
    return `**FraudWatch AI Help**\n\n**Ask me about:**\n\n📚 Definitions:\n"What is fraud?", "privilege escalation", "data exfiltration"\n\n🛡️ Prevention:\n"How to prevent fraud", "account security tips"\n\n🚨 Recovery:\n"What to do after fraud", "how to report fraud"\n\n📊 System Data:\n"Show alerts", "high risk employees", "anomalies"\n\n🔍 Investigation:\n"How to investigate", "best practices"\n\nJust ask naturally!`;
  }

  // ===== DEFINITIONS =====
  if (msg.includes("what is fraud") || msg.includes("define fraud") || (msg.includes("fraud") && msg.includes("definition"))) {
    return FRAUD_KNOWLEDGE.definitions.fraud;
  }

  if (msg.includes("insider") && (msg.includes("fraud") || msg.includes("threat"))) {
    return FRAUD_KNOWLEDGE.definitions.insider_fraud;
  }

  if (msg.includes("privilege") && (msg.includes("escalation") || msg.includes("escalate"))) {
    return FRAUD_KNOWLEDGE.definitions.privilege_escalation;
  }

  if (msg.includes("bulk download") || msg.includes("mass download") || msg.includes("data download")) {
    return FRAUD_KNOWLEDGE.definitions.bulk_download;
  }

  if (msg.includes("exfiltration") || msg.includes("data theft") || msg.includes("steal data")) {
    return FRAUD_KNOWLEDGE.definitions.data_exfiltration;
  }

  if (msg.includes("account takeover") || msg.includes("ato") || msg.includes("hacked account")) {
    return FRAUD_KNOWLEDGE.definitions.account_takeover;
  }

  if (msg.includes("social engineering") || msg.includes("phishing") || msg.includes("pretexting")) {
    return FRAUD_KNOWLEDGE.definitions.social_engineering;
  }

  if (msg.includes("money laundering") || msg.includes("launder")) {
    return FRAUD_KNOWLEDGE.definitions.money_laundering;
  }

  if (msg.includes("anomaly") || msg.includes("anomalies")) {
    if (msg.includes("what") || msg.includes("define") || msg.includes("meaning")) {
      return FRAUD_KNOWLEDGE.definitions.anomaly;
    }
    return getDynamicResponse("anomalies", liveData);
  }

  if (msg.includes("risk score") || msg.includes("score meaning") || msg.includes("what does the score")) {
    return FRAUD_KNOWLEDGE.definitions.risk_score;
  }

  // ===== PREVENTION =====
  if (msg.includes("prevent") || msg.includes("protection") || msg.includes("how to stop") || msg.includes("avoid")) {
    if (msg.includes("privilege") || msg.includes("escalation")) {
      return FRAUD_KNOWLEDGE.prevention.privilege_escalation;
    }
    if (msg.includes("data") || msg.includes("theft") || msg.includes("steal")) {
      return FRAUD_KNOWLEDGE.prevention.data_theft;
    }
    if (msg.includes("social") || msg.includes("phishing") || msg.includes("engineering")) {
      return FRAUD_KNOWLEDGE.prevention.social_engineering;
    }
    if (msg.includes("account") || msg.includes("password") || msg.includes("credential")) {
      return FRAUD_KNOWLEDGE.prevention.account_security;
    }
    return FRAUD_KNOWLEDGE.prevention.general;
  }

  if (msg.includes("safe") || msg.includes("secure") || msg.includes("security tips") || msg.includes("best practice")) {
    if (msg.includes("account") || msg.includes("password")) {
      return FRAUD_KNOWLEDGE.prevention.account_security;
    }
    return FRAUD_KNOWLEDGE.prevention.general;
  }

  // ===== RECOVERY & NEXT STEPS =====
  if (msg.includes("after fraud") || msg.includes("discovered fraud") || msg.includes("what to do") || msg.includes("next step") || msg.includes("suffered fraud") || msg.includes("victim")) {
    if (msg.includes("breach") || msg.includes("data")) {
      return FRAUD_KNOWLEDGE.recovery.data_breach;
    }
    if (msg.includes("account") || msg.includes("hacked") || msg.includes("compromise")) {
      return FRAUD_KNOWLEDGE.recovery.account_compromise;
    }
    return FRAUD_KNOWLEDGE.recovery.after_fraud;
  }

  if (msg.includes("report") && (msg.includes("fraud") || msg.includes("suspicious") || msg.includes("how"))) {
    return FRAUD_KNOWLEDGE.recovery.reporting;
  }

  if (msg.includes("breach") && (msg.includes("data") || msg.includes("after") || msg.includes("response"))) {
    return FRAUD_KNOWLEDGE.recovery.data_breach;
  }

  // ===== INVESTIGATION =====
  if (msg.includes("investigate") || msg.includes("investigation")) {
    if (msg.includes("best practice") || msg.includes("tips") || msg.includes("how to")) {
      return FRAUD_KNOWLEDGE.investigation.best_practices;
    }
    return FRAUD_KNOWLEDGE.investigation.process;
  }

  // ===== SYSTEM DATA QUERIES =====
  if (msg.includes("alert")) {
    if (msg.includes("high") || msg.includes("critical") || msg.includes("priority") || msg.includes("urgent")) {
      return getDynamicResponse("alerts_high", liveData);
    }
    return getDynamicResponse("alerts_summary", liveData);
  }

  if (msg.includes("employee") || msg.includes("user") || msg.includes("staff")) {
    if (msg.includes("high risk") || msg.includes("risky") || msg.includes("dangerous")) {
      return getDynamicResponse("employees_highrisk", liveData);
    }
    const stats = (liveData && liveData.stats) || {};
    const total = stats.totalEmployees ?? 0;
    const highRisk = stats.highRiskUsers ?? 0;
    if (total === 0 && highRisk === 0) return NO_DATA_MSG;
    return `**Employee Monitoring**\n\n• Total Monitored: ${total}\n• High Risk: ${highRisk}\n\nAsk "high risk employees" for details.`;
  }

  if (msg.includes("high risk") || msg.includes("risky")) {
    return getDynamicResponse("employees_highrisk", liveData);
  }

  if (msg.includes("status") || msg.includes("system") || msg.includes("health") || msg.includes("dashboard")) {
    return getDynamicResponse("status", liveData);
  }

  if (msg.includes("today") || msg.includes("recent") || msg.includes("latest")) {
    return getDynamicResponse("anomalies", liveData);
  }

  // Specific employee lookup — match by name from live alerts/activities
  const alerts = (liveData && liveData.alerts) || [];
  const activities = (liveData && liveData.activities) || [];
  const allNames = [...new Set([...alerts.map((a) => a.employeeName), ...activities.map((a) => a.employeeName)].filter(Boolean))];
  const employeeMatch = allNames.find((name) => name && msg.includes(name.toLowerCase()));
  if (employeeMatch) {
    const empAlerts = alerts.filter((a) => a.employeeName === employeeMatch);
    const empActivities = activities.filter((a) => a.employeeName === employeeMatch);
    const firstAlert = empAlerts[0];
    const firstAct = empActivities[0];
    const dept = firstAlert?.department || firstAct?.department || "—";
    const role = firstAlert?.role || firstAct?.role || "—";
    const risk = firstAlert?.riskScore ?? firstAct?.riskScore ?? "—";
    return `**${employeeMatch}**\n\nDepartment: ${dept}\nRole: ${role}\nRisk Score: ${risk}%\n\nAlerts: ${empAlerts.length}\nRecent Activities: ${empActivities.length}\n\n${empAlerts.length > 0 ? `Latest Alert:\n• ${(firstAlert.activityType || "").replace(/_/g, " ")}\n• Severity: ${firstAlert.severity}\n• Status: ${firstAlert.status}` : "No active alerts."}`;
  }

  // Type of fraud queries
  if (msg.includes("type") && msg.includes("fraud")) {
    return `**Types of Internal Fraud**\n\n1. **Data Theft** - Stealing sensitive information\n2. **Privilege Escalation** - Gaining unauthorized access\n3. **Embezzlement** - Misappropriating funds\n4. **Account Takeover** - Compromising user accounts\n5. **Social Engineering** - Manipulating people\n6. **Insider Trading** - Using confidential info\n\nAsk about any specific type for details!`;
  }

  // Fallback with suggestions
  const fallbacks = [
    "I can help with fraud-related questions. Try asking:\n\n• \"What is privilege escalation?\"\n• \"How to prevent data theft?\"\n• \"What to do after discovering fraud?\"\n• \"Show high risk alerts\"",
    "Let me help you better! I know about:\n\n• Fraud definitions\n• Prevention strategies\n• Recovery steps\n• System alerts & data\n\nWhat would you like to know?",
    "I'm your fraud detection assistant. Ask me about:\n\n• Types of fraud\n• How to stay safe\n• What to do if fraud occurs\n• Current system alerts",
  ];

  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text: "Hello! I'm FraudWatch AI Assistant. Ask me about fraud definitions, prevention tips, or what to do after fraud. How can I help you today?",
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [liveData, setLiveData] = useState({ stats: {}, alerts: [], activities: [] });
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch live data from MongoDB (stats, alerts, activities) for dynamic responses
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.get("/api/activities/stats").then(({ data }) => data.success ? data : { stats: {}, departmentStats: [], riskDistribution: [], recentTimeline: [] }),
      api.get("/api/alerts?limit=100").then(({ data }) => data.success && data.data ? data.data : []),
      api.get("/api/activities?limit=100").then(({ data }) => data.success && data.data ? data.data : []),
    ]).then(([statsRes, alerts, activities]) => {
      if (cancelled) return;
      setLiveData({
        stats: statsRes.stats || {},
        alerts: Array.isArray(alerts) ? alerts : [],
        activities: Array.isArray(activities) ? activities : [],
      });
    }).catch(() => {
      if (!cancelled) setLiveData({ stats: {}, alerts: [], activities: [] });
    });
    return () => { cancelled = true; };
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), type: "user", text: input, time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = getBotResponse(currentInput, liveData);
      setMessages((prev) => [...prev, { id: Date.now(), type: "bot", text: response, time: new Date() }]);
      setIsTyping(false);
    }, 600 + Math.random() * 600);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    { label: "What is Fraud?", query: "what is fraud" },
    { label: "Prevention Tips", query: "how to prevent fraud" },
    { label: "After Fraud", query: "what to do after fraud" },
    { label: "High Risk Alerts", query: "show high priority alerts" },
  ];

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 32px rgba(59,130,246,0.4)",
          zIndex: 9998,
        }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={24} color="#fff" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <MessageCircle size={24} color="#fff" />
            </motion.div>
          )}
        </AnimatePresence>
        {!isOpen && (
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "#22c55e",
              border: "2px solid #0a0e1a",
            }}
          />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            style={{
              position: "fixed",
              bottom: 100,
              right: 24,
              width: 400,
              height: 560,
              background: "rgba(15,22,41,0.98)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 20,
              boxShadow: "0 25px 80px rgba(0,0,0,0.6)",
              zIndex: 9999,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Sparkles size={20} color="#fff" />
              </div>
              <div>
                <h4 style={{ color: "#fff", fontSize: 14, fontWeight: 600, margin: 0 }}>FraudWatch AI</h4>
                <p style={{ color: "#22c55e", fontSize: 11, margin: 0, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
                  Online - Ask me anything
                </p>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ display: "flex", justifyContent: msg.type === "user" ? "flex-end" : "flex-start" }}
                >
                  <div
                    style={{
                      maxWidth: "88%",
                      padding: "10px 14px",
                      borderRadius: msg.type === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                      background: msg.type === "user" ? "linear-gradient(135deg, #3b82f6, #2563eb)" : "rgba(255,255,255,0.06)",
                      border: msg.type === "bot" ? "1px solid rgba(255,255,255,0.08)" : "none",
                    }}
                  >
                    <p
                      style={{
                        color: "#fff",
                        fontSize: 13,
                        lineHeight: 1.6,
                        margin: 0,
                        whiteSpace: "pre-line",
                      }}
                      dangerouslySetInnerHTML={{
                        __html: msg.text
                          .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#60a5fa">$1</strong>')
                          .replace(/\n/g, "<br/>"),
                      }}
                    />
                    <p
                      style={{
                        color: msg.type === "user" ? "rgba(255,255,255,0.6)" : "#64748b",
                        fontSize: 10,
                        marginTop: 6,
                        textAlign: "right",
                      }}
                    >
                      {msg.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    display: "flex",
                    gap: 4,
                    padding: "10px 14px",
                    background: "rgba(255,255,255,0.06)",
                    borderRadius: 14,
                    width: "fit-content",
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }}
                      style={{ width: 6, height: 6, borderRadius: "50%", background: "#64748b" }}
                    />
                  ))}
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {messages.length <= 2 && (
              <div style={{ padding: "0 16px 12px", display: "flex", gap: 8, flexWrap: "wrap" }}>
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => {
                      setInput(action.query);
                      setTimeout(() => handleSend(), 50);
                    }}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 20,
                      background: "rgba(59,130,246,0.1)",
                      border: "1px solid rgba(59,130,246,0.2)",
                      color: "#60a5fa",
                      fontSize: 11,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => (e.target.style.background = "rgba(59,130,246,0.2)")}
                    onMouseLeave={(e) => (e.target.style.background = "rgba(59,130,246,0.1)")}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            <div style={{ padding: 12, borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: 8 }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about fraud, prevention, alerts..."
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  padding: "10px 14px",
                  color: "#fff",
                  fontSize: 13,
                  outline: "none",
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: input.trim() ? "linear-gradient(135deg, #3b82f6, #8b5cf6)" : "rgba(255,255,255,0.05)",
                  border: "none",
                  cursor: input.trim() ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                }}
              >
                <Send size={18} color={input.trim() ? "#fff" : "#64748b"} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
