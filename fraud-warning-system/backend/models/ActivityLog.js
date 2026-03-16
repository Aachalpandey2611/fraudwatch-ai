const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    employeeName: { type: String, required: true },
    employeeId: { type: String, required: true },
    department: { type: String, required: true },
    role: { type: String, required: true },
    actionType: {
      type: String,
      enum: [
        "login",
        "transaction",
        "data_access",
        "bulk_download",
        "account_modification",
        "privilege_escalation",
        "report_generation",
        "customer_lookup",
      ],
      required: true,
    },
    systemAccessed: { type: String, required: true },
    dataVolume: { type: Number, default: 0 }, // in MB or records
    ipAddress: { type: String },
    location: { type: String },
    deviceInfo: { type: String },
    sessionDuration: { type: Number, default: 0 }, // in minutes
    transactionAmount: { type: Number, default: 0 },
    accountsAccessed: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now },
    riskScore: { type: Number, default: 0 },
    isAnomaly: { type: Boolean, default: false },
    flaggedReasons: [{ type: String }],
  },
  { timestamps: true },
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);
