/**
 * Seed the database with the 5 dummy alerts/activities for the dashboard.
 * Run: node scripts/seedDummyData.js  (or npm run seed:dummy)
 * Requires MongoDB to be running (e.g. mongod or MongoDB Atlas).
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const ActivityLog = require("../models/ActivityLog");
const Alert = require("../models/Alert");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/fraud_warning_system";

const now = Date.now();
const oneHour = 60 * 60 * 1000;

const DUMMY_ENTRIES = [
  {
    employeeId: "EMP001",
    employeeName: "Marcus Thompson",
    department: "Loans",
    role: "Loan Officer",
    riskScore: 96,
    actionType: "bulk_download",
    timeAgoMs: 1 * oneHour, // 1h ago
  },
  {
    employeeId: "EMP003",
    employeeName: "David Chen",
    department: "Treasury",
    role: "Treasury Operator",
    riskScore: 88,
    actionType: "privilege_escalation",
    timeAgoMs: 3 * oneHour, // 3h ago
  },
  {
    employeeId: "EMP004",
    employeeName: "Lisa Rodriguez",
    department: "IT Admin",
    role: "System Administrator",
    riskScore: 79,
    actionType: "account_modification",
    timeAgoMs: 5 * oneHour, // 5h ago
  },
  {
    employeeId: "EMP007",
    employeeName: "Ahmed Hassan",
    department: "Loans",
    role: "Senior Loan Officer",
    riskScore: 72,
    actionType: "transaction",
    timeAgoMs: 8 * oneHour, // 8h ago
  },
  {
    employeeId: "EMP005",
    employeeName: "James Okafor",
    department: "Compliance",
    role: "Compliance Officer",
    riskScore: 83,
    actionType: "report_generation",
    timeAgoMs: 6 * oneHour, // 6h ago
  },
  {
    employeeId: "EMP006",
    employeeName: "Sarah Kim",
    department: "Risk Management",
    role: "Risk Analyst",
    riskScore: 75,
    actionType: "data_access",
    timeAgoMs: 2 * oneHour, // 2h ago
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Cannot connect to MongoDB:", err.message);
    console.error("Start MongoDB (e.g. run 'mongod') or set MONGO_URI in .env");
    process.exit(1);
  }

  await ActivityLog.deleteMany({});
  await Alert.deleteMany({});
  console.log("Cleared existing activities and alerts");

  for (const entry of DUMMY_ENTRIES) {
    const timestamp = new Date(now - entry.timeAgoMs);
    const activityLog = await ActivityLog.create({
      userId: entry.employeeId,
      employeeName: entry.employeeName,
      employeeId: entry.employeeId,
      department: entry.department,
      role: entry.role,
      actionType: entry.actionType,
      systemAccessed: "Core Banking",
      riskScore: entry.riskScore,
      isAnomaly: true,
      flaggedReasons: [`Risk score ${entry.riskScore}% - flagged for review`],
      timestamp,
    });

    await Alert.create({
      employeeId: entry.employeeId,
      employeeName: entry.employeeName,
      department: entry.department,
      role: entry.role,
      riskScore: entry.riskScore,
      activityType: entry.actionType,
      systemAccessed: "Core Banking",
      reasons: [`Risk score ${entry.riskScore}% - flagged for review`],
      status: "open",
      activityLogId: activityLog._id,
      timestamp,
    });
  }

  console.log("Seeded", DUMMY_ENTRIES.length, "alerts/activities:");
  DUMMY_ENTRIES.forEach((e) =>
    console.log(`  - ${e.employeeName} ${e.riskScore}% ${e.actionType}`)
  );
  await mongoose.connection.close();
  console.log("Done. Start the backend and frontend, then log in to see data.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
