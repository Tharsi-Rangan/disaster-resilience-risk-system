const router = require("express").Router();
const { body } = require("express-validator");

const auth = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");
const controller = require("../controllers/riskProject.controller");

// CREATE (ADMIN)
router.post(
  "/",
  auth,
  requireRole("ADMIN"),
  [
    body("title").notEmpty().withMessage("title is required"),
    body("location.lat").isFloat({ min: -90, max: 90 }).withMessage("valid lat required"),
    body("location.lng").isFloat({ min: -180, max: 180 }).withMessage("valid lng required"),
    body("location.address").optional().isString(),
  ],
  controller.createProject
);

// READ ALL (ADMIN + CONTRACTOR)
router.get("/", auth, requireRole("ADMIN", "CONTRACTOR"), controller.listProjects);

// READ ONE (ADMIN + CONTRACTOR)
router.get("/:id", auth, requireRole("ADMIN", "CONTRACTOR"), controller.getProjectById);

// UPDATE (ADMIN)
router.put(
  "/:id",
  auth,
  requireRole("ADMIN"),
  [
    body("title").optional().isString(),
    body("location.lat").optional().isFloat({ min: -90, max: 90 }),
    body("location.lng").optional().isFloat({ min: -180, max: 180 }),
    body("location.address").optional().isString(),
  ],
  controller.updateProject
);

// DELETE (ADMIN)
router.delete("/:id", auth, requireRole("ADMIN"), controller.deleteProject);

module.exports = router;