const express = require("express");
const router = express.Router();
const {
  analyzeActivity,
  getConfig,
  updateConfig,
} = require("../controllers/mlController");
const { protect, authorizeRole } = require("../middleware/authMiddleware");

router.post("/analyze", protect, analyzeActivity);
router.get("/config", protect, authorizeRole("admin"), getConfig);
router.put("/config", protect, authorizeRole("admin"), updateConfig);

module.exports = router;
