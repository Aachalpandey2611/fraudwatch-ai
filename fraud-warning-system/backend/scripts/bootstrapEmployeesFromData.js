require("dotenv").config();
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const Employee = require("../models/Employee");
const ActivityLog = require("../models/ActivityLog");
const Alert = require("../models/Alert");

const normalizeNameKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

async function collectRecords() {
  const [nativeActivities, legacyActivities, nativeAlerts, legacyAlerts] =
    await Promise.all([
      ActivityLog.find({}, { employeeName: 1, department: 1 }).lean(),
      ActivityLog.db
        .collection("activities")
        .find(
          {},
          { projection: { employeeName: 1, employee_name: 1, department: 1 } },
        )
        .toArray(),
      Alert.find({}, { employeeName: 1, department: 1 }).lean(),
      Alert.db
        .collection("alerts")
        .find(
          {},
          { projection: { employeeName: 1, employee_name: 1, department: 1 } },
        )
        .toArray(),
    ]);

  const rows = [];
  nativeActivities.forEach((r) => rows.push(r));
  legacyActivities.forEach((r) =>
    rows.push({
      employeeName: r.employeeName || r.employee_name,
      department: r.department,
    }),
  );
  nativeAlerts.forEach((r) => rows.push(r));
  legacyAlerts.forEach((r) =>
    rows.push({
      employeeName: r.employeeName || r.employee_name,
      department: r.department,
    }),
  );

  const dedup = new Map();
  rows.forEach((row) => {
    const name = String(row.employeeName || "").trim();
    const key = normalizeNameKey(name);
    if (!key) return;
    if (!dedup.has(key)) {
      dedup.set(key, {
        name,
        department: row.department || "Customer Service",
      });
    }
  });

  return Array.from(dedup.entries()).map(([key, value]) => ({
    employeeId: key,
    email: `${key}@employee.local`,
    password: `${key}@123`,
    name: value.name,
    department: value.department,
  }));
}

async function run() {
  await connectDB();
  const employees = await collectRecords();

  if (!employees.length) {
    console.log("No employee records found in activities/alerts collections.");
    process.exit(0);
  }

  for (const employee of employees) {
    const passwordHash = await bcrypt.hash(employee.password, 10);
    await Employee.findOneAndUpdate(
      { employeeId: employee.employeeId },
      {
        $set: {
          employeeId: employee.employeeId,
          name: employee.name,
          email: employee.email,
          department: employee.department,
          role: "employee",
          passwordHash,
        },
      },
      { upsert: true, new: true },
    );
  }

  console.log(`Provisioned ${employees.length} employee accounts.`);
  console.log("Credential format: employeeId + '@123'");
  console.log("Examples:");
  employees.slice(0, 12).forEach((employee) => {
    console.log(
      `- ${employee.name}: id=${employee.employeeId} password=${employee.password}`,
    );
  });
  process.exit(0);
}

run().catch((error) => {
  console.error("Failed to provision employee accounts:", error.message);
  process.exit(1);
});
