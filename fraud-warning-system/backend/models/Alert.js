const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const alertSchema = new mongoose.Schema(
  {
    alertId: { type: String, default: () => uuidv4(), unique: true },
    employeeId: { type: String, required: true },
    employeeName: { type: String, required: true },
    department: { type: String, required: true },
    role: { type: String },
    riskScore: { type: Number, required: true },
    anomalyScore: { type: Number, default: 0 },
    activityType: { type: String, required: true },
    systemAccessed: { type: String },
    reasons: [{ type: String }],
    status: {
      type: String,
      enum: ["open", "investigating", "resolved", "false_positive"],
      default: "open",
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    assignedTo: { type: String, default: "" },
    notes: { type: String, default: "" },
    activityLogId: { type: mongoose.Schema.Types.ObjectId, ref: "ActivityLog" },
    timestamp: { type: Date, default: Date.now },
    resolvedAt: { type: Date },
  },
  { timestamps: true },
);

// Compute severity from riskScore
alertSchema.pre("save", function (next) {
  if (this.riskScore >= 90) this.severity = "critical";
  else if (this.riskScore >= 75) this.severity = "high";
  else if (this.riskScore >= 50) this.severity = "medium";
  else this.severity = "low";
  next();
});

module.exports = mongoose.model("Alert", alertSchema);
