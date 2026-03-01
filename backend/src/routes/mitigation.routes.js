const router = require("express").Router();
const authMiddleware = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");
const {generateMitigationPlan,getLatestMitigationPlan,getMitigationHistory, deleteMitigationPlan,} = require("../controllers/mitigation.controller");

// test route (protected)
router.post(
  "/generate/:projectId",
  authMiddleware,
  requireRole("ADMIN", "CONTRACTOR"),
  generateMitigationPlan
);

router.get(
  "/:projectId/history",
  authMiddleware,
  requireRole("ADMIN", "CONTRACTOR"),
  getMitigationHistory
);

router.delete(
  "/:id",
  authMiddleware,
  requireRole("ADMIN"),
  deleteMitigationPlan
);

module.exports = router;