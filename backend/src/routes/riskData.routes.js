const router = require("express").Router();
const { body, param } = require("express-validator");

const auth = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");
const controller = require("../controllers/riskData.controller");

// POST fetch snapshot (requires login)
router.post(
  "/fetch/:projectId",
  auth,
  requireRole("ADMIN", "CONTRACTOR"),
  [
    param("projectId").isMongoId().withMessage("Invalid projectId"),

    body("lat")
      .optional()
      .toFloat()
      .isFloat({ min: -90, max: 90 })
      .withMessage("Valid lat is required"),

    body("lng")
      .optional()
      .toFloat()
      .isFloat({ min: -180, max: 180 })
      .withMessage("Valid lng is required"),
  ],
  controller.fetchRiskData
);

// GET latest snapshot
router.get(
  "/:projectId/latest",
  auth,
  requireRole("ADMIN", "CONTRACTOR"),
  [param("projectId").isMongoId().withMessage("Invalid projectId")],
  controller.getLatest
);

// GET snapshot history
router.get(
  "/:projectId/history",
  auth,
  requireRole("ADMIN", "CONTRACTOR"),
  [param("projectId").isMongoId().withMessage("Invalid projectId")],
  controller.getHistory
);

// DELETE snapshot (admin only)
router.delete(
  "/:snapshotId",
  auth,
  requireRole("ADMIN"),
  [param("snapshotId").isMongoId().withMessage("Invalid snapshotId")],
  controller.removeSnapshot
);

module.exports = router;