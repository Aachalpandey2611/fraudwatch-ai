const Alert = require("../models/Alert");
const mongoose = require("mongoose");

const computeSeverity = (riskScore) => {
  if (riskScore >= 90) return "critical";
  if (riskScore >= 75) return "high";
  if (riskScore >= 50) return "medium";
  return "low";
};

const normalizeStatus = (status) => {
  const normalized = String(status || "open").toLowerCase();
  const allowed = ["open", "investigating", "resolved", "false_positive"];
  return allowed.includes(normalized) ? normalized : "open";
};

const toAlertShape = (doc) => {
  const riskScore = Number(doc.riskScore || 0);
  return {
    _id: doc._id,
    alertId: doc.alertId || String(doc._id),
    employeeId: doc.employeeId || doc.employee_id || "N/A",
    employeeName: doc.employeeName || doc.employee_name || "Unknown Employee",
    department: doc.department || "Unknown",
    role: doc.role || "",
    riskScore,
    activityType: String(doc.activityType || doc.activity_type || "data_access")
      .replace(/\s+/g, "_")
      .toLowerCase(),
    systemAccessed: doc.systemAccessed || "Core Banking",
    reasons: Array.isArray(doc.reasons) ? doc.reasons : [],
    status: normalizeStatus(doc.status),
    severity: doc.severity || computeSeverity(riskScore),
    assignedTo: doc.assignedTo || "",
    notes: doc.notes || "",
    activityLogId: doc.activityLogId,
    timestamp: doc.timestamp
      ? new Date(doc.timestamp)
      : new Date(doc.createdAt || Date.now()),
    resolvedAt: doc.resolvedAt || null,
  };
};

const getLegacyAlerts = async () => {
  const docs = await Alert.db.collection("alerts").find({}).toArray();
  return docs.map(toAlertShape);
};

// @desc    Get all alerts
// @route   GET /api/alerts
const getAlerts = async (req, res) => {
  try {
    const { status, severity, page = 1, limit = 50 } = req.query;

    const limitNum = Number(limit);
    const pageNum = Number(page);
    const allAlerts = await getLegacyAlerts();
    const filtered = allAlerts
      .filter((a) => {
        if (status && a.status !== status) return false;
        if (severity && a.severity !== severity) return false;
        return true;
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const total = filtered.length;
    const alerts = filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.json({ success: true, data: alerts, total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get single alert
// @route   GET /api/alerts/:id
const getAlert = async (req, res) => {
  try {
    let alert = await Alert.findById(req.params.id).populate("activityLogId");
    if (alert) alert = toAlertShape(alert.toObject());
    if (!alert) {
      const collection = Alert.db.collection("alerts");
      const query = { _id: req.params.id };
      if (/^[a-f\d]{24}$/i.test(req.params.id)) {
        query._id = new mongoose.Types.ObjectId(req.params.id);
      }
      const legacy = await collection.findOne(query);
      if (legacy) alert = toAlertShape(legacy);
    }
    if (!alert) {
      return res
        .status(404)
        .json({ success: false, message: "Alert not found" });
    }
    res.json({ success: true, data: alert });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Update alert status
// @route   PUT /api/alerts/:id
const updateAlert = async (req, res) => {
  try {
    const { status, assignedTo, notes } = req.body;
    const update = {};
    if (status) update.status = normalizeStatus(status);
    if (assignedTo) update.assignedTo = assignedTo;
    if (notes) update.notes = notes;
    if (status === "resolved") update.resolvedAt = new Date();

    let alert = await Alert.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });

    if (!alert) {
      const collection = Alert.db.collection("alerts");
      const query = { _id: req.params.id };
      if (/^[a-f\d]{24}$/i.test(req.params.id)) {
        query._id = new mongoose.Types.ObjectId(req.params.id);
      }
      await collection.updateOne(query, { $set: update });
      const updatedLegacy = await collection.findOne(query);
      if (updatedLegacy) alert = toAlertShape(updatedLegacy);
    } else {
      alert = toAlertShape(alert.toObject());
    }

    if (!alert) {
      return res
        .status(404)
        .json({ success: false, message: "Alert not found" });
    }

    // Emit status update
    if (global.io) {
      global.io.emit("alert_updated", {
        alertId: alert._id,
        status: alert.status,
      });
    }

    res.json({ success: true, data: alert });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get alert summary
// @route   GET /api/alerts/summary
const getAlertSummary = async (req, res) => {
  try {
    const legacy = await getLegacyAlerts();
    const statusMap = new Map();
    const sevMap = new Map();
    legacy.forEach((a) => {
      statusMap.set(a.status, (statusMap.get(a.status) || 0) + 1);
      sevMap.set(a.severity, (sevMap.get(a.severity) || 0) + 1);
    });
    const summary = Array.from(statusMap.entries()).map(([k, v]) => ({
      _id: k,
      count: v,
    }));
    const bySeverity = Array.from(sevMap.entries()).map(([k, v]) => ({
      _id: k,
      count: v,
    }));

    res.json({ success: true, summary, bySeverity });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getAlerts, getAlert, updateAlert, getAlertSummary };
