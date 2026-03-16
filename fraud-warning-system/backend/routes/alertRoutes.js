const express = require("express");
const router = express.Router();
const {
  getAlerts,
  getAlert,
  updateAlert,
  getAlertSummary,
} = require("../controllers/alertController");
const { protect, authorizeRole } = require("../middleware/authMiddleware");

router.get("/summary", protect, authorizeRole("admin"), getAlertSummary);
router.get("/", protect, authorizeRole("admin"), getAlerts);
router.get("/:id", protect, authorizeRole("admin"), getAlert);
router.put("/:id", protect, authorizeRole("admin"), updateAlert);

module.exports = router;
