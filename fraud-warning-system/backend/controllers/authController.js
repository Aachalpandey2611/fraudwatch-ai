const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const Employee = require("../models/Employee");
const User = require("../models/User");
const ActivityLog = require("../models/ActivityLog");
const Alert = require("../models/Alert");

let lastEmployeeSyncAt = 0;
const EMPLOYEE_SYNC_INTERVAL_MS = 5 * 60 * 1000;

const escapeRegExp = (str) =>
  String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const normalizeNameKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const toTitleCase = (text) =>
  String(text || "")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const credentialsFromName = (name) => {
  const key = normalizeNameKey(name);
  return {
    key,
    employeeId: key,
    email: `${key}@employee.local`,
    password: `${key}@123`,
  };
};

const upsertEmployeeFromRecord = async (record) => {
  const name = String(record?.employeeName || record?.name || "").trim();
  if (!name) return null;

  const creds = credentialsFromName(name);
  if (!creds.key) return null;

  const department = String(record?.department || "Customer Service").trim();
  const passwordHash = await bcrypt.hash(creds.password, 10);

  const employee = await Employee.findOneAndUpdate(
    { employeeId: creds.employeeId },
    {
      $set: {
        employeeId: creds.employeeId,
        name,
        email: creds.email,
        department,
        role: "employee",
        passwordHash,
      },
    },
    { upsert: true, new: true },
  );

  return employee;
};

const syncEmployeesFromData = async () => {
  const now = Date.now();
  if (now - lastEmployeeSyncAt < EMPLOYEE_SYNC_INTERVAL_MS) return;

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

  const merged = [];
  nativeActivities.forEach((row) => merged.push(row));
  legacyActivities.forEach((row) =>
    merged.push({
      employeeName: row.employeeName || row.employee_name,
      department: row.department,
    }),
  );
  nativeAlerts.forEach((row) => merged.push(row));
  legacyAlerts.forEach((row) =>
    merged.push({
      employeeName: row.employeeName || row.employee_name,
      department: row.department,
    }),
  );

  const dedup = new Map();
  merged.forEach((row) => {
    const key = normalizeNameKey(row?.employeeName);
    if (!key) return;
    if (!dedup.has(key)) {
      dedup.set(key, {
        employeeName: row.employeeName,
        department: row.department || "Customer Service",
      });
    }
  });

  for (const record of dedup.values()) {
    await upsertEmployeeFromRecord(record);
  }

  lastEmployeeSyncAt = now;
};

const ensureEmployeeFromIdentity = async (identity, password) => {
  const identityText = String(identity || "").trim();
  if (!identityText) return null;

  const nameLike = toTitleCase(identityText.replace(/[._-]/g, " "));
  const keyFromIdentity = normalizeNameKey(
    identityText.includes("@") ? identityText.split("@")[0] : identityText,
  );
  if (!keyFromIdentity) return null;

  const expectedPassword = `${keyFromIdentity}@123`;
  if (password !== expectedPassword) return null;

  const employee = await upsertEmployeeFromRecord({
    employeeName: nameLike,
    department: "Customer Service",
  });
  return employee;
};

const generateToken = ({ id, role, principalType }) => {
  const secret = process.env.JWT_SECRET || "dev-secret-change-in-production";
  return jwt.sign({ id, role, principalType }, secret, { expiresIn: "8h" });
};

const DEFAULT_ADMIN_EMAIL =
  process.env.DEFAULT_ADMIN_EMAIL || "admin@fraudwatch.local";
const DEFAULT_ADMIN_PASSWORD =
  process.env.DEFAULT_ADMIN_PASSWORD || "Admin@123";
const DEFAULT_ADMIN_NAME = process.env.DEFAULT_ADMIN_NAME || "System Admin";

const findLegacyUser = async ({ usernameOrEmail, role }) => {
  if (!usernameOrEmail) return null;
  const legacy = await User.findOne({
    $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
  });
  if (!legacy) return null;

  if (role === "admin" && legacy.role === "admin") {
    return {
      type: "admin",
      name: legacy.name,
      email: legacy.email,
      passwordHash: legacy.password,
    };
  }

  if (role === "employee" && legacy.role !== "admin") {
    return {
      type: "employee",
      employeeId: String(legacy._id),
      name: legacy.name,
      email: legacy.email,
      department: legacy.department || "Customer Service",
      passwordHash: legacy.password,
    };
  }

  return null;
};

const ensureAdminFromLegacy = async (usernameOrEmail) => {
  const legacy = await findLegacyUser({ usernameOrEmail, role: "admin" });
  if (!legacy) return null;

  let admin = await Admin.findOne({ email: legacy.email });
  if (!admin) {
    admin = await Admin.create({
      name: legacy.name,
      email: legacy.email,
      passwordHash: legacy.passwordHash,
      role: "admin",
    });
  }
  return admin;
};

const ensureDefaultAdmin = async (identity, password) => {
  const normalizedIdentity = String(identity || "")
    .trim()
    .toLowerCase();
  const normalizedDefaultEmail = String(DEFAULT_ADMIN_EMAIL)
    .trim()
    .toLowerCase();

  if (!normalizedIdentity || normalizedIdentity !== normalizedDefaultEmail) {
    return null;
  }

  if (password !== DEFAULT_ADMIN_PASSWORD) {
    return null;
  }

  let admin = await Admin.findOne({ email: DEFAULT_ADMIN_EMAIL });
  if (!admin) {
    const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
    admin = await Admin.create({
      name: DEFAULT_ADMIN_NAME,
      email: DEFAULT_ADMIN_EMAIL,
      passwordHash,
      role: "admin",
    });
  }

  return admin;
};

const ensureEmployeeFromLegacy = async (usernameOrEmail) => {
  const legacy = await findLegacyUser({ usernameOrEmail, role: "employee" });
  if (!legacy) return null;

  let employee = await Employee.findOne({ email: legacy.email });
  if (!employee) {
    employee = await Employee.create({
      employeeId: legacy.employeeId,
      name: legacy.name,
      email: legacy.email,
      department: legacy.department,
      passwordHash: legacy.passwordHash,
      role: "employee",
    });
  }
  return employee;
};

// @desc    Admin login
// @route   POST /api/auth/admin-login
const adminLogin = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const identity = email || username;

    if (!identity || !password) {
      return res.status(400).json({
        success: false,
        message: "Email/username and password are required",
      });
    }

    let admin = await Admin.findOne({ $or: [{ email: identity }] });
    if (!admin) {
      admin = await ensureAdminFromLegacy(identity);
    }
    if (!admin) {
      admin = await ensureDefaultAdmin(identity, password);
    }

    if (admin && (await admin.matchPassword(password))) {
      return res.json({
        success: true,
        token: generateToken({
          id: admin._id,
          role: "admin",
          principalType: "admin",
        }),
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: "admin",
        },
      });
    }

    res.status(401).json({ success: false, message: "Invalid credentials" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Employee login
// @route   POST /api/auth/employee-login
const employeeLogin = async (req, res) => {
  try {
    const { email, employeeId, username, name, password } = req.body;
    const identity = email || employeeId || username || name;

    if (!identity || !password) {
      return res.status(400).json({
        success: false,
        message: "Email/employeeId and password are required",
      });
    }

    await syncEmployeesFromData();

    const identityRegex = new RegExp(`^${escapeRegExp(identity)}$`, "i");

    let employee = await Employee.findOne({
      $or: [
        { email: identity },
        { employeeId: identity },
        { name: identityRegex },
      ],
    });
    if (!employee) {
      employee = await ensureEmployeeFromLegacy(identity);
    }
    if (!employee) {
      employee = await ensureEmployeeFromIdentity(identity, password);
    }

    if (employee && (await employee.matchPassword(password))) {
      return res.json({
        success: true,
        token: generateToken({
          id: employee._id,
          role: "employee",
          principalType: "employee",
        }),
        employee: {
          id: employee._id,
          employeeId: employee.employeeId,
          name: employee.name,
          email: employee.email,
          department: employee.department,
          role: "employee",
        },
      });
    }

    res.status(401).json({ success: false, message: "Invalid credentials" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

module.exports = { adminLogin, employeeLogin, getMe };
