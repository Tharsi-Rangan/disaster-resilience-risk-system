const router = require("express").Router();
const { body } = require("express-validator");

const auth = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");

const controller = require("../controllers/riskData.controller");

// POST fetch snapshot (requires login)
router.post(
  "/fetch/:projectId",
  auth,
  requireRole("ADMIN", "CONTRACTOR"),
  [
    body("lat").isFloat({ min: -90, max: 90 }).withMessage("Valid lat is required"),
    body("lng").isFloat({ min: -180, max: 180 }).withMessage("Valid lng is required"),
  ],
  controller.fetchRiskData
);

// GET latest
router.get(
  "/:projectId/latest",
  auth,
  requireRole("ADMIN", "CONTRACTOR"),
  controller.getLatest
);

// GET history
router.get(
  "/:projectId/history",
  auth,
  requireRole("ADMIN", "CONTRACTOR"),
  controller.getHistory
);

// DELETE snapshot (admin-only)
router.delete(
  "/:snapshotId",
  auth,
  requireRole("ADMIN"),
  controller.removeSnapshot
);

module.exports = router;