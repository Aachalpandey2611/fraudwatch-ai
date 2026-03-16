require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const ActivityLog = require("../models/ActivityLog");
const Alert = require("../models/Alert");
const mlService = require("./mlService");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/fraud_warning_system";

const employees = [
  {
    userId: "EMP001",
    employeeName: "Marcus Thompson",
    employeeId: "EMP001",
    department: "Loans",
    role: "Loan Officer",
  },
  {
    userId: "EMP002",
    employeeName: "Priya Sharma",
    employeeId: "EMP002",
    department: "Customer Service",
    role: "CS Representative",
  },
  {
    userId: "EMP003",
    employeeName: "David Chen",
    employeeId: "EMP003",
    department: "Treasury",
    role: "Treasury Operator",
  },
  {
    userId: "EMP004",
    employeeName: "Lisa Rodriguez",
    employeeId: "EMP004",
    department: "IT Admin",
    role: "System Administrator",
  },
  {
    userId: "EMP005",
    employeeName: "James Okafor",
    employeeId: "EMP005",
    department: "Compliance",
    role: "Compliance Officer",
  },
  {
    userId: "EMP006",
    employeeName: "Sarah Kim",
    employeeId: "EMP006",
    department: "Risk Management",
    role: "Risk Analyst",
  },
  {
    userId: "EMP007",
    employeeName: "Ahmed Hassan",
    employeeId: "EMP007",
    department: "Loans",
    role: "Senior Loan Officer",
  },
  {
    userId: "EMP008",
    employeeName: "Nicole Brown",
    employeeId: "EMP008",
    department: "Customer Service",
    role: "CS Manager",
  },
];

const systems = [
  "Core Banking",
  "CRM",
  "Loan Management",
  "Treasury Portal",
  "Admin Console",
  "Customer Portal",
  "Report Generator",
  "Data Warehouse",
];
const locations = [
  "New York, NY",
  "Chicago, IL",
  "Los Angeles, CA",
  "Remote-VPN",
  "Unknown Location",
  "Dallas, TX",
  "London, UK",
];
const actionTypes = [
  "login",
  "transaction",
  "data_access",
  "bulk_download",
  "account_modification",
  "privilege_escalation",
  "report_generation",
  "customer_lookup",
];

const randomBetween = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generateActivity = (isSuspicious = false) => {
  const employee = randomFrom(employees);
  const now = new Date();
  const hoursBack = randomBetween(0, 168); // Last 7 days
  now.setHours(now.getHours() - hoursBack);

  let actionType = randomFrom(actionTypes);
  let dataVolume = randomBetween(1, 100);
  let transactionAmount = 0;
  let accountsAccessed = randomBetween(1, 10);
  let location = randomFrom(locations.slice(0, 4));
  let hour = now.getHours();

  if (isSuspicious) {
    actionType = randomFrom([
      "bulk_download",
      "privilege_escalation",
      "account_modification",
      "transaction",
    ]);
    dataVolume = randomBetween(500, 2000);
    transactionAmount = randomBetween(100000, 5000000);
    accountsAccessed = randomBetween(50, 500);
    location = randomFrom(["Remote-VPN", "Unknown Location", "London, UK"]);
    now.setHours(randomFrom([1, 2, 3, 22, 23])); // Odd hours
  }

  if (actionType === "transaction")
    transactionAmount = randomBetween(1000, 50000);

  return {
    ...employee,
    actionType,
    systemAccessed: randomFrom(systems),
    dataVolume,
    ipAddress: `192.168.${randomBetween(1, 255)}.${randomBetween(1, 255)}`,
    location,
    deviceInfo: randomFrom([
      "Windows 10 - Chrome",
      "MacOS - Safari",
      "Linux - Firefox",
      "Windows 11 - Edge",
    ]),
    sessionDuration: randomBetween(5, 480),
    transactionAmount,
    accountsAccessed,
    timestamp: now,
  };
};

const seedDatabase = async () => {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  // Clear existing data
  await ActivityLog.deleteMany({});
  await Alert.deleteMany({});
  console.log("Cleared existing data");

  const activities = [];
  // Generate 150 normal + 30 suspicious activities
  for (let i = 0; i < 150; i++) activities.push(generateActivity(false));
  for (let i = 0; i < 30; i++) activities.push(generateActivity(true));

  console.log(`Generating ${activities.length} activity logs...`);

  for (const actData of activities) {
    try {
      const mlResult = await mlService.analyzeActivity(actData);
      const activity = new ActivityLog({
        ...actData,
        riskScore: mlResult.riskScore,
        isAnomaly: mlResult.isAnomaly,
        flaggedReasons: mlResult.reasons,
      });
      await activity.save();

      if (mlResult.isAnomaly && mlResult.riskScore >= 40) {
        const alert = new Alert({
          employeeId: actData.employeeId,
          employeeName: actData.employeeName,
          department: actData.department,
          role: actData.role,
          riskScore: mlResult.riskScore,
          activityType: actData.actionType,
          systemAccessed: actData.systemAccessed,
          reasons: mlResult.reasons,
          activityLogId: activity._id,
          timestamp: actData.timestamp,
        });
        await alert.save();
      }
    } catch (e) {
      console.error("Error saving activity:", e.message);
    }
  }

  const actCount = await ActivityLog.countDocuments();
  const alertCount = await Alert.countDocuments();
  console.log(`\nSeeding complete!`);
  console.log(`Activities: ${actCount}`);
  console.log(`Alerts: ${alertCount}`);
  mongoose.connection.close();
};

seedDatabase().catch(console.error);
