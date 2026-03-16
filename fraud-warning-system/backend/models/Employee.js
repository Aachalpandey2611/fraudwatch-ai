const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const employeeSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    department: { type: String, required: true },
    role: { type: String, default: "employee", enum: ["employee"] },
  },
  { timestamps: true, collection: "employees" },
);

employeeSchema.methods.matchPassword = async function matchPassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model("Employee", employeeSchema);
