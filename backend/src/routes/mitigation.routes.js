const router = require("express").Router();
const authMiddleware = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");
const { projectOwnerOrAdminByParam } = require("../middleware/project.middleware");
const {
  generateMitigationPlan,
  getLatestMitigationPlan,
  getMitigationHistory,
  deleteMitigationPlan,
  getAllMitigationPlans,
  updateRecommendation,
  deleteRecommendation,
} = require("../controllers/mitigation.controller");

// test route (protected)
router.post(
  "/generate/:projectId",
  authMiddleware,
  requireRole("ADMIN", "CONTRACTOR"),
  projectOwnerOrAdminByParam("projectId"),
  generateMitigationPlan
);

router.get(
  "/all",
  authMiddleware,
  requireRole("ADMIN"),
  getAllMitigationPlans
);

router.get(
  "/:projectId/history",
  authMiddleware,
  requireRole("ADMIN", "CONTRACTOR"),
  projectOwnerOrAdminByParam("projectId"),
  getMitigationHistory
);

router.get(
  "/:projectId/latest",
  authMiddleware,
  requireRole("ADMIN", "CONTRACTOR"),
  projectOwnerOrAdminByParam("projectId"),
  getLatestMitigationPlan
);

router.delete(
  "/:id",
  authMiddleware,
  requireRole("ADMIN"),
  deleteMitigationPlan
);

router.patch(
  "/:planId/recommendations/:recId",
  authMiddleware,
  requireRole("ADMIN", "CONTRACTOR"),
  updateRecommendation
);

router.delete(
  "/:planId/recommendations/:recId",
  authMiddleware,
  requireRole("ADMIN", "CONTRACTOR"),
  deleteRecommendation
);

module.exports = router;