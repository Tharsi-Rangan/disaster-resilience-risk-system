const router = require("express").Router();
const { body, param } = require("express-validator"); // ✅ NEWLY ADDED: param

const auth = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");

const controller = require("../controllers/riskData.controller");

/* ✅ NEWLY ADDED: RiskProject CRUD routes */
const riskProjectRoutes = require("./riskProject.routes");
router.use("/projects", riskProjectRoutes);
/* ✅ END */

// POST fetch snapshot (requires login)
router.post(
  "/fetch/:projectId",
  auth,
  requireRole("ADMIN", "CONTRACTOR"),
  [
    /* ✅ NEWLY ADDED: validate projectId */
    param("projectId").isMongoId().withMessage("Invalid projectId"),
    /* ✅ END */

    body("lat")
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage("Valid lat is required"),
    body("lng")
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage("Valid lng is required"),
  ],
  controller.fetchRiskData
);

// GET latest
router.get(
  "/:projectId/latest",
  auth,
  requireRole("ADMIN", "CONTRACTOR"),
  /* ✅ NEWLY ADDED: validate projectId */
  [param("projectId").isMongoId().withMessage("Invalid projectId")],
  /* ✅ END */
  controller.getLatest
);

// GET history
router.get(
  "/:projectId/history",
  auth,
  requireRole("ADMIN", "CONTRACTOR"),
  /* ✅ NEWLY ADDED: validate projectId */
  [param("projectId").isMongoId().withMessage("Invalid projectId")],
  /* ✅ END */
  controller.getHistory
);

// DELETE snapshot (admin-only)
router.delete(
  "/:snapshotId",
  auth,
  requireRole("ADMIN"),
  /* ✅ NEWLY ADDED: validate snapshotId */
  [param("snapshotId").isMongoId().withMessage("Invalid snapshotId")],
  /* ✅ END */
  controller.removeSnapshot
);

module.exports = router;