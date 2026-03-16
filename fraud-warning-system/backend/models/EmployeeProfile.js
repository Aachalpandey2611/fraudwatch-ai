const mongoose = require("mongoose");

const employeeProfileSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true, unique: true, index: true },
    employeeName: { type: String, required: true },
    department: { type: String, required: true },
    avgLoginHour: { type: Number, default: 9 },
    avgAccountsAccessed: { type: Number, default: 0 },
    avgDataVolume: { type: Number, default: 0 },
    avgTransactionAmount: { type: Number, default: 0 },
    typicalSessionDuration: { type: Number, default: 30 },
    activityHistory: { type: Number, default: 0 },
    lastActivityAt: { type: Date },
  },
  { timestamps: true, collection: "employee_profiles" },
);

module.exports = mongoose.model("EmployeeProfile", employeeProfileSchema);
