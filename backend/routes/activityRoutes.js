const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema({
  employeeName: String,
  department: String,
  actionType: String,
  systemAccessed: String,
  dataVolume: Number,
  location: String,
  timestamp: String,
});

const Activity = mongoose.model("Activity", ActivitySchema);

// GET all activities
router.get("/activities", async (req, res) => {
  const activities = await Activity.find();
  res.json(activities);
});

// POST new activity
router.post("/activities", async (req, res) => {
  const activity = new Activity(req.body);
  await activity.save();
  res.json(activity);
});

module.exports = router;
