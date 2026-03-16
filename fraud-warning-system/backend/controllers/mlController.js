const mlService = require("../services/mlService");
const MLConfig = require("../models/MLConfig");

const DEFAULT_CONFIG = {
  activeAlgorithm: "isolation_forest",
  riskThreshold: 70,
  modelSensitivity: "medium",
};

const getOrCreateConfig = async () => {
  let config = await MLConfig.findOne().sort({ updatedAt: -1 });
  if (!config) config = await MLConfig.create(DEFAULT_CONFIG);
  return config;
};

const isAdminUser = async (req) => {
  return req.user?.role === "admin";
};

// @desc    Analyze activity for fraud
// @route   POST /api/ml/analyze
const analyzeActivity = async (req, res) => {
  try {
    const activityData = req.body;
    const result = await mlService.analyzeActivity(activityData);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "ML analysis failed",
      error: error.message,
    });
  }
};

// @desc    Get ML configuration
// @route   GET /api/ml/config
const getConfig = async (req, res) => {
  try {
    const config = await getOrCreateConfig();
    res.json({ success: true, data: config });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch ML config" });
  }
};

// @desc    Update ML configuration
// @route   PUT /api/ml/config
const updateConfig = async (req, res) => {
  try {
    const admin = await isAdminUser(req);
    if (!admin) {
      return res
        .status(403)
        .json({ success: false, message: "Admin access required" });
    }

    const updates = {};
    if (req.body.activeAlgorithm)
      updates.activeAlgorithm = req.body.activeAlgorithm;
    if (req.body.riskThreshold !== undefined)
      updates.riskThreshold = Number(req.body.riskThreshold);
    if (req.body.modelSensitivity)
      updates.modelSensitivity = req.body.modelSensitivity;

    const config = await getOrCreateConfig();
    Object.assign(config, updates);
    await config.save();

    res.json({ success: true, data: config });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update ML config" });
  }
};

module.exports = {
  analyzeActivity,
  getConfig,
  updateConfig,
  getOrCreateConfig,
};
