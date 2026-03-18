const express = require("express");
const http = require("http");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// ✅ IMPORTANT: allowed origin (NO slash)
const allowedOrigin = "https://fraudwatch-ai-v8um.vercel.app";

// ✅ GLOBAL CORS (must be FIRST)
app.use(cors({
  origin: allowedOrigin,
  credentials: true
}));

// ✅ VERY IMPORTANT: handle ALL preflight requests manually
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", allowedOrigin);
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200); // 🔥 THIS FIXES YOUR ERROR
  }

  next();
});

// ✅ Body parser
app.use(express.json());

// ✅ TEST ROUTE (check if server works)
app.get("/", (req, res) => {
  res.send("Backend working");
});

// ✅ Routes
app.use("/api", require("./routes"));

// ✅ Start server
server.listen(5000, () => {
  console.log("Server running on port 5000");
});
