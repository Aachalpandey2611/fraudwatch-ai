const express = require("express");
const router = express.Router();
const {
  getActivities,
  createActivity,
  getStats,
} = require("../controllers/activityController");
const {
  protect,
  authorizeRole,
  authorizePrincipalType,
} = require("../middleware/authMiddleware");

router.get("/stats", protect, authorizeRole("admin"), getStats);
router.get("/", protect, authorizeRole("admin"), getActivities);
router.post(
  "/",
  protect,
  authorizeRole("employee", "admin"),
  authorizePrincipalType("employee", "admin"),
  createActivity,
);

module.exports = router;
