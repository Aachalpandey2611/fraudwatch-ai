const ActivityLog = require("../models/ActivityLog");
const Alert = require("../models/Alert");
const mlService = require("../services/mlService");
const {
  getOrCreateProfile,
  calculateDeviations,
  updateProfile,
} = require("../services/baselineService");
const { getOrCreateConfig } = require("./mlController");

const clampRisk = (value) => Math.max(0, Math.min(100, Number(value) || 0));

const normalizeActionType = (raw) => {
  const known = [
    "login",
    "transaction",
    "data_access",
    "bulk_download",
    "account_modification",
    "privilege_escalation",
    "report_generation",
    "customer_lookup",
  ];
  if (known.includes(raw)) return raw;
  return "data_access";
};

const buildFallbackMLResult = (
  activityData,
  deviations = {},
  failureMessage = "",
) => {
  let riskScore = 8;

  const action = String(activityData.actionType || "");
  if (action === "customer_lookup") riskScore += 3;
  if (action === "transaction") riskScore += 8;
  if (action === "report_generation") riskScore += 10;
  if (action === "account_modification") riskScore += 16;
  if (action === "bulk_download") riskScore += 26;
  if (action === "privilege_escalation") riskScore += 34;

  const accountsAccessed = Number(activityData.accountsAccessed || 0);
  const dataVolume = Number(activityData.dataVolume || 0);
  const txAmount = Number(activityData.transactionAmount || 0);
  const sessionDuration = Number(activityData.sessionDuration || 0);

  riskScore += Math.min(18, accountsAccessed * 0.5);
  riskScore += Math.min(22, dataVolume / 10);
  riskScore += Math.min(12, sessionDuration / 15);
  if (txAmount >= 100000) riskScore += 8;
  if (txAmount >= 500000) riskScore += 10;

  const location = String(activityData.location || "").toLowerCase();
  if (location && !location.includes("main")) {
    riskScore += 8;
  }

  const deviationValues = Object.values(deviations)
    .map((v) => Number(v))
    .filter((v) => Number.isFinite(v));

  if (deviationValues.length) {
    const deviationScore = deviationValues.reduce((sum, value) => {
      const normalized = Math.min(1, Math.abs(value));
      return sum + normalized * 3;
    }, 0);
    riskScore += Math.min(18, deviationScore);
  }

  riskScore = clampRisk(Math.round(riskScore));
  const isAnomaly = riskScore >= 75;

  const reasons = [];
  if (action === "privilege_escalation")
    reasons.push("Privilege escalation attempt");
  if (action === "bulk_download") reasons.push("Unusually large data download");
  if (accountsAccessed >= 25) reasons.push("High number of accounts accessed");
  if (dataVolume >= 150) reasons.push("High data volume transferred");
  if (sessionDuration >= 180) reasons.push("Unusually long session duration");
  if (location && !location.includes("main"))
    reasons.push("Unusual location detected");
  if (!reasons.length) reasons.push("Fallback baseline risk scoring applied");
  if (failureMessage)
    reasons.push("ML service unavailable, fallback scoring used");

  return {
    riskScore,
    isAnomaly,
    reasons,
    anomalyScore: Number((riskScore / 100).toFixed(3)),
  };
};

const normalizeMlResult = (rawResult, activityData = {}, deviations = {}) => {
  const isAnomaly = Boolean(rawResult?.isAnomaly);
  const rawRisk = clampRisk(rawResult?.riskScore);

  const decisionScore = Number(rawResult?.decisionScore);
  const anomalyScore = Number(rawResult?.anomalyScore);

  let riskFromSignal = rawRisk;
  if (Number.isFinite(decisionScore)) {
    const anomalyProb = 1 / (1 + Math.exp(3 * decisionScore));
    riskFromSignal = clampRisk(Math.round(anomalyProb * 100));
  } else if (Number.isFinite(anomalyScore)) {
    // score_samples tends to cluster near -0.5 in IF; lower means riskier.
    const anomalyProb = 1 / (1 + Math.exp(12 * (anomalyScore + 0.5)));
    riskFromSignal = clampRisk(Math.round(anomalyProb * 100));
  }

  const heuristicRisk = buildFallbackMLResult(
    activityData,
    deviations,
  ).riskScore;

  let riskScore = clampRisk(
    Math.round(riskFromSignal * 0.45 + rawRisk * 0.15 + heuristicRisk * 0.4),
  );

  // Keep classes mostly consistent while still allowing realistic score spread.
  if (!isAnomaly) riskScore = Math.min(riskScore, 78);
  if (isAnomaly) riskScore = Math.max(riskScore, 52);

  const reasons = Array.isArray(rawResult?.reasons)
    ? rawResult.reasons.filter((r) => Boolean(r))
    : [];
  if (!reasons.length) {
    reasons.push(
      isAnomaly
        ? "Statistical behavioral anomaly detected by ML model"
        : "Normal activity pattern",
    );
  }

  const anomalyScoreSafe = Number(rawResult?.anomalyScore);

  return {
    ...rawResult,
    isAnomaly,
    riskScore,
    reasons,
    anomalyScore: Number.isFinite(anomalyScoreSafe)
      ? anomalyScoreSafe
      : Number((riskScore / 100).toFixed(3)),
  };
};

const inferRiskScore = (doc) => {
  if (doc.riskScore !== undefined) return clampRisk(doc.riskScore);
  const label = String(doc.label || "").toLowerCase();
  if (label === "fraud") return 88;

  const base =
    Number(doc.data_download_mb || 0) / 4 +
    Number(doc.transactions_count || 0) * 1.2 +
    Number(doc.location_change || 0) * 22 +
    Number(doc.vpn_used || 0) * 18 +
    Number(doc.privilege_change || 0) * 24;
  return clampRisk(Math.round(base));
};

const inferActionType = (doc) => {
  if (doc.actionType) return normalizeActionType(doc.actionType);
  if (Number(doc.privilege_change || 0) > 0) return "privilege_escalation";
  if (Number(doc.data_download_mb || 0) >= 120) return "bulk_download";
  if (Number(doc.transactions_count || 0) > 0) return "transaction";
  return "login";
};

const toActivityShape = (doc) => {
  const riskScore = inferRiskScore(doc);
  const isAnomaly =
    doc.isAnomaly !== undefined
      ? Boolean(doc.isAnomaly)
      : String(doc.label || "").toLowerCase() === "fraud" || riskScore >= 75;

  return {
    _id: doc._id,
    userId: doc.userId || doc.employee_id || doc.employeeId || "unknown",
    employeeName: doc.employeeName || doc.employee_name || "Unknown Employee",
    employeeId: doc.employeeId || doc.employee_id || "N/A",
    department: doc.department || "Unknown",
    role: doc.role || "Employee",
    actionType: inferActionType(doc),
    systemAccessed: doc.systemAccessed || "Core Banking",
    dataVolume: Number(doc.dataVolume ?? doc.data_download_mb ?? 0),
    ipAddress: doc.ipAddress || "",
    location:
      doc.location ||
      (Number(doc.location_change || 0) > 0
        ? "Location Changed"
        : "Primary Office"),
    deviceInfo: doc.deviceInfo || "",
    sessionDuration: Number(doc.sessionDuration || 0),
    transactionAmount: Number(doc.transactionAmount || 0),
    accountsAccessed: Number(doc.accountsAccessed || 0),
    timestamp: doc.timestamp
      ? new Date(doc.timestamp)
      : new Date(doc.createdAt || Date.now()),
    riskScore,
    isAnomaly,
    flaggedReasons:
      Array.isArray(doc.flaggedReasons) && doc.flaggedReasons.length
        ? doc.flaggedReasons
        : isAnomaly
          ? ["Flagged by imported dataset"]
          : [],
  };
};

const getLegacyActivities = async () => {
  const collection = ActivityLog.db.collection("activities");
  const docs = await collection.find({}).toArray();
  return docs.map(toActivityShape);
};

const getNativeActivities = async () => {
  const docs = await ActivityLog.find({}).lean();
  return docs.map(toActivityShape);
};

const getAllActivities = async () => {
  const [nativeActivities, legacyActivities] = await Promise.all([
    getNativeActivities(),
    getLegacyActivities(),
  ]);

  const merged = new Map();
  [...legacyActivities, ...nativeActivities].forEach((a) => {
    merged.set(String(a._id), a);
  });
  return Array.from(merged.values());
};

const normalizeIncomingActivity = (payload, reqUser) => {
  const ts = payload.timestamp ? new Date(payload.timestamp) : new Date();
  const normalized = {
    clientLocalHour: Number(payload.clientLocalHour),
    clientDayOfWeek: Number(payload.clientDayOfWeek),
    userId: String(
      payload.userId || payload.employeeId || reqUser?.id || "unknown",
    ),
    employeeId: String(
      payload.employeeId || payload.userId || reqUser?.id || "unknown",
    ),
    employeeName: payload.employeeName || reqUser?.name || "Unknown Employee",
    department: payload.department || reqUser?.department || "Customer Service",
    role: payload.role || reqUser?.role || "analyst",
    actionType: normalizeActionType(payload.actionType || "login"),
    systemAccessed: payload.systemAccessed || "Core Banking",
    dataVolume: Number(payload.dataVolume || 0),
    ipAddress: payload.ipAddress || "",
    location: payload.location || "Primary Office",
    deviceInfo: payload.deviceInfo || "",
    sessionDuration: Number(payload.sessionDuration || 0),
    transactionAmount: Number(payload.transactionAmount || 0),
    accountsAccessed: Number(payload.accountsAccessed || 0),
    timestamp: ts,
  };

  if (
    !normalized.employeeId ||
    !normalized.employeeName ||
    !normalized.department
  ) {
    throw new Error("Missing required employee fields");
  }

  return normalized;
};

// @desc    Get all activities
// @route   GET /api/activities
const getActivities = async (req, res) => {
  try {
    const {
      department,
      actionType,
      riskLevel,
      page = 1,
      limit = 50,
    } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (actionType) filter.actionType = actionType;
    if (riskLevel === "high") filter.riskScore = { $gte: 75 };
    else if (riskLevel === "medium") filter.riskScore = { $gte: 40, $lt: 75 };
    else if (riskLevel === "low") filter.riskScore = { $lt: 40 };

    const limitNum = Math.max(1, Number(limit) || 50);
    const pageNum = Math.max(1, Number(page) || 1);

    const allActivities = await getAllActivities();
    const filtered = allActivities
      .filter((a) => {
        if (department && a.department !== department) return false;
        if (actionType && a.actionType !== actionType) return false;
        if (riskLevel === "high" && a.riskScore < 75) return false;
        if (riskLevel === "medium" && (a.riskScore < 40 || a.riskScore >= 75))
          return false;
        if (riskLevel === "low" && a.riskScore >= 40) return false;
        return true;
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const total = filtered.length;
    const activities = filtered.slice(
      (pageNum - 1) * limitNum,
      pageNum * limitNum,
    );

    res.json({
      success: true,
      data: activities,
      total,
      page: pageNum,
      pages: Math.max(1, Math.ceil(total / limitNum)),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Log new activity
// @route   POST /api/activities
const createActivity = async (req, res) => {
  try {
    const activityData = normalizeIncomingActivity(req.body, req.user);

    const profile = await getOrCreateProfile(activityData);
    const deviations = calculateDeviations(activityData, profile);

    const mlPayload = {
      ...activityData,
      ...deviations,
      baseline: {
        avgLoginHour: profile.avgLoginHour,
        avgAccountsAccessed: profile.avgAccountsAccessed,
        avgDataVolume: profile.avgDataVolume,
        avgTransactionAmount: profile.avgTransactionAmount,
        typicalSessionDuration: profile.typicalSessionDuration,
      },
    };

    let mlResult;
    let mlStatus = "ml";
    let mlWarning = null;

    try {
      mlResult = await mlService.analyzeActivity(mlPayload);
    } catch (mlError) {
      mlStatus = "fallback";
      mlWarning = mlError.message || "ML service unavailable";
      mlResult = buildFallbackMLResult(activityData, deviations, mlWarning);
    }

    mlResult = normalizeMlResult(mlResult, activityData, deviations);

    const activity = new ActivityLog(activityData);
    activity.riskScore = mlResult.riskScore;
    activity.isAnomaly = mlResult.isAnomaly;
    activity.flaggedReasons = mlResult.reasons;

    await activity.save();
    await updateProfile(profile, activityData);

    const config = await getOrCreateConfig();
    const threshold = Number(config.riskThreshold || 70);

    // Create alert when risk score exceeds configured threshold
    if (Number(mlResult.riskScore) > threshold) {
      const alert = new Alert({
        employeeId: activityData.employeeId,
        employeeName: activityData.employeeName,
        department: activityData.department,
        role: activityData.role,
        riskScore: mlResult.riskScore,
        anomalyScore: mlResult.anomalyScore,
        activityType: activityData.actionType,
        systemAccessed: activityData.systemAccessed,
        reasons: mlResult.reasons,
        activityLogId: activity._id,
        timestamp: activityData.timestamp,
      });
      await alert.save();

      // Emit real-time alert via socket.io
      if (global.io) {
        global.io.emit("new_alert", {
          alert: {
            ...alert.toObject(),
            anomalyScore: mlResult.anomalyScore,
          },
          activity: {
            ...activity.toObject(),
            anomalyScore: mlResult.anomalyScore,
          },
        });
      }
    }

    res.status(201).json({
      success: true,
      data: activity,
      mlResult,
      mlStatus,
      mlWarning,
      deviations,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
};

// @desc    Get activity stats
// @route   GET /api/activities/stats
const getStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const allActivities = await getAllActivities();
    const allAlerts = (await Alert.find({}).lean()).map((a) => ({
      employeeId: a.employeeId || a.employee_id || "N/A",
      riskScore: Number(a.riskScore || 0),
    }));

    const totalEmployees = new Set(allActivities.map((a) => a.employeeId)).size;
    const totalAlerts = allAlerts.length;
    const highRiskUsers = new Set(
      allAlerts.filter((a) => a.riskScore >= 75).map((a) => a.employeeId),
    ).size;
    const anomaliesToday = allActivities.filter(
      (a) => a.isAnomaly && new Date(a.timestamp) >= today,
    ).length;

    const byDept = new Map();
    allActivities.forEach((a) => {
      const curr = byDept.get(a.department) || {
        _id: a.department,
        count: 0,
        totalRisk: 0,
        anomalies: 0,
      };
      curr.count += 1;
      curr.totalRisk += Number(a.riskScore || 0);
      curr.anomalies += a.isAnomaly ? 1 : 0;
      byDept.set(a.department, curr);
    });
    const departmentStats = Array.from(byDept.values())
      .map((d) => ({
        _id: d._id,
        count: d.count,
        avgRisk: d.count ? d.totalRisk / d.count : 0,
        anomalies: d.anomalies,
      }))
      .sort((a, b) => b.anomalies - a.anomalies);

    const buckets = [
      { _id: 0, count: 0 },
      { _id: 25, count: 0 },
      { _id: 50, count: 0 },
      { _id: 75, count: 0 },
      { _id: 90, count: 0 },
    ];
    allActivities.forEach((a) => {
      const r = Number(a.riskScore || 0);
      if (r < 25) buckets[0].count += 1;
      else if (r < 50) buckets[1].count += 1;
      else if (r < 75) buckets[2].count += 1;
      else if (r < 90) buckets[3].count += 1;
      else buckets[4].count += 1;
    });
    const riskDistribution = buckets;

    const recentTimeline = allActivities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 50)
      .map((a) => ({
        employeeName: a.employeeName,
        actionType: a.actionType,
        riskScore: a.riskScore,
        timestamp: a.timestamp,
        department: a.department,
      }));

    res.json({
      success: true,
      stats: { totalEmployees, totalAlerts, highRiskUsers, anomaliesToday },
      departmentStats,
      riskDistribution,
      recentTimeline,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getActivities, createActivity, getStats };
