const mongoose = require("mongoose");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/fraud_detection";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Database connection failed:", error.message);
    console.error(
      "Make sure MongoDB is running (e.g. run 'mongod' or start MongoDB service).",
    );
    console.error(
      "Or set MONGO_URI in .env to your MongoDB connection string.",
    );
    process.exit(1);
  }
};

module.exports = connectDB;
