const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const activityRoutes = require("./routes/activityRoutes");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api", activityRoutes);

app.get("/", (req, res) => {
  res.send("Fraud Detection Backend Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
