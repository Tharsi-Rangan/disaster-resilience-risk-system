const router = require("express").Router();
const ctrl = require("../controllers/assessment.controller");

// Use your existing middleware (names may differ slightly)
const auth = require("../middleware/auth_middleware");
const role = require("../middleware/role.middleware");

// CONTRACTOR can run + view
router.post("/run/:projectId", auth, role(["CONTRACTOR", "ADMIN"]), ctrl.runAssessment);
router.get("/:projectId/latest", auth, role(["CONTRACTOR", "ADMIN"]), ctrl.getLatest);
router.get("/:projectId/history", auth, role(["CONTRACTOR", "ADMIN"]), ctrl.getHistory);

// ADMIN can delete
router.delete("/:id", auth, role(["ADMIN"]), ctrl.deleteOne);

module.exports = router;