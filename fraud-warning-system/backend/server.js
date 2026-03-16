require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const connectDB = require("./config/db");

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

const ALLOWED_ORIGINS = (
  process.env.CLIENT_URLS ||
  "http://localhost:5173,http://localhost:3000,https://frontend-snowy-psi-40.vercel.app"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile, curl, Postman) or known origins
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    if (process.env.NODE_ENV !== "production") return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === "production" ? ALLOWED_ORIGINS : "*",
    methods: ["GET", "POST"],
  },
});

// Store io instance globally
global.io = io;

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Socket.io connection
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/activities", require("./routes/activityRoutes"));
app.use("/api/alerts", require("./routes/alertRoutes"));
app.use("/api/ml", require("./routes/mlRoutes"));

// Health check
app.get("/api/health", (req, res) =>
  res.json({ status: "OK", message: "Fraud Warning System Backend Running" }),
);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io ready for real-time alerts`);
});

module.exports = { app, io };
