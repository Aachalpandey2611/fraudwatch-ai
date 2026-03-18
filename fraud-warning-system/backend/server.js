const express = require("express");
const http = require("http");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// ✅ CORS CONFIG (IMPORTANT)
app.use(cors({
  origin: "https://fraudwatch-ai-v8um.vercel.app", // your frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// ✅ Handle preflight requests
app.options("*", cors());

// ✅ Body parser
app.use(express.json());

// ✅ Routes (example)
app.use("/api", require("./routes"));

// ✅ Server start
server.listen(5000, () => {
  console.log("Server running on port 5000");
});
