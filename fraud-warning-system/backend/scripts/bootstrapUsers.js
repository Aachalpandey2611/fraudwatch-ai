require("dotenv").config();
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const Admin = require("../models/Admin");
const Employee = require("../models/Employee");

async function bootstrapUsers() {
  await connectDB();

  const adminPasswordHash = await bcrypt.hash("Admin@123", 10);
  const employeePasswordHash = await bcrypt.hash("Employee@123", 10);

  await Admin.updateOne(
    { email: "admin@fraudwatch.local" },
    {
      $set: {
        name: "System Admin",
        email: "admin@fraudwatch.local",
        role: "admin",
        passwordHash: adminPasswordHash,
      },
    },
    { upsert: true },
  );

  await Employee.updateOne(
    { email: "employee1@bank.local" },
    {
      $set: {
        employeeId: "EMP1001",
        name: "Operations Employee",
        email: "employee1@bank.local",
        department: "Customer Service",
        role: "employee",
        passwordHash: employeePasswordHash,
      },
    },
    { upsert: true },
  );

  console.log("Default admin/employee users are ready.");
  console.log("Admin: admin@fraudwatch.local / Admin@123");
  console.log("Employee: employee1@bank.local / Employee@123");
  process.exit(0);
}

bootstrapUsers().catch((error) => {
  console.error("Failed to bootstrap users:", error.message);
  process.exit(1);
});
