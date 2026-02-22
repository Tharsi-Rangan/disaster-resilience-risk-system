const router = require("express").Router();

const authMiddleware = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");

const {
  fetchRiskDataForProject,
  getLatestRiskData,
  getRiskHistory,
  deleteSnapshot,
} = require("../controllers/riskData.controller");

// CONTRACTOR + ADMIN can fetch/view
router.post(
  "/fetch/:projectId",
  authMiddleware,
  requireRole("ADMIN", "CONTRACTOR"),
  fetchRiskDataForProject
);

router.get(
  "/:projectId/latest",
  authMiddleware,
  requireRole("ADMIN", "CONTRACTOR"),
  getLatestRiskData
);

router.get(
  "/:projectId/history",
  authMiddleware,
  requireRole("ADMIN", "CONTRACTOR"),
  getRiskHistory
);

// Only ADMIN can delete snapshot
router.delete(
  "/:snapshotId",
  authMiddleware,
  requireRole("ADMIN"),
  deleteSnapshot
);

module.exports = router;