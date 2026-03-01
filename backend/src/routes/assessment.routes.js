const router = require("express").Router();
const ctrl = require("../controllers/assessment.controller");

const auth = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");

// Contractor/Admin can run + view
router.post("/run/:projectId", auth, requireRole("CONTRACTOR", "ADMIN"), ctrl.runAssessment);
router.get("/:projectId/latest", auth, requireRole("CONTRACTOR", "ADMIN"), ctrl.getLatest);
router.get("/:projectId/history", auth, requireRole("CONTRACTOR", "ADMIN"), ctrl.getHistory);

// Admin only delete
router.delete("/:id", auth, requireRole("ADMIN"), ctrl.deleteOne);

module.exports = router;