const express = require("express");
const router = express.Router();
const projectController = require("../controllers/project.controller");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

// All routes require authentication
router.use(authMiddleware);

// CRUD
router.post("/", projectController.createProject);
router.get("/", projectController.getProjects);
router.get("/:id", projectController.getProjectById);
router.put("/:id", projectController.updateProject);
router.delete("/:id", projectController.deleteProject);
router.patch(":id/status", roleMiddleware("admin"), projectController.updateProjectStatus);

module.exports = router;