const axios = require("axios");

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:5001";

const analyzeActivity = async (activity) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/analyze`, activity, {
      timeout: 5000,
    });
    const data = response.data || {};
    if (
      typeof data.riskScore !== "number" ||
      typeof data.isAnomaly !== "boolean" ||
      !Array.isArray(data.reasons) ||
      typeof data.anomalyScore !== "number"
    ) {
      throw new Error("ML service returned invalid response payload");
    }
    return data;
  } catch (error) {
    throw new Error(`ML analysis failed: ${error.message}`);
  }
};

module.exports = { analyzeActivity };
