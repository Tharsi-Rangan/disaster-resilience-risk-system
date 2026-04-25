const mongoose = require("mongoose");
const Project = require("../models/Project");

exports.ownerOrAdmin = (model) => async (req, res, next) => {
  try {
    const doc = await model.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });

    if (String(req.user?.role || '').toUpperCase() !== "ADMIN" && !doc.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.projectOwnerOrAdminByParam = (paramName = "projectId") => async (req, res, next) => {
  try {
    const projectId = req.params?.[paramName];
    if (!projectId) {
      return res.status(400).json({ message: "Project id is required" });
    }

    if (!mongoose.isValidObjectId(projectId)) {
      return res.status(400).json({
        errors: [{ type: "field", path: paramName, msg: `Invalid ${paramName}`, value: projectId }],
      });
    }

    const project = await Project.findById(projectId).select("createdBy");
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const userRole = String(req.user?.role || '').toUpperCase();
    if (userRole !== "ADMIN" && !project.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    next();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
