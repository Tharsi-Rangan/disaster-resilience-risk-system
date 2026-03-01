const { validationResult } = require("express-validator");
const RiskProject = require("../models/RiskProject");

/**
 * POST /api/risk-data/projects
 * ADMIN only
 */
const createProject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, location } = req.body;

    const project = await RiskProject.create({
      title,
      location,
      createdBy: req.user?._id, // optional: use logged-in user
    });

    return res.status(201).json({ message: "RiskProject created ✅", project });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/risk-data/projects
 * ADMIN + CONTRACTOR
 */
const listProjects = async (req, res) => {
  try {
    const projects = await RiskProject.find().sort({ createdAt: -1 });
    return res.json({ count: projects.length, projects });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/risk-data/projects/:id
 */
const getProjectById = async (req, res) => {
  try {
    const project = await RiskProject.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "RiskProject not found" });
    return res.json({ project });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * PUT /api/risk-data/projects/:id
 * ADMIN only
 */
const updateProject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const updated = await RiskProject.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) return res.status(404).json({ message: "RiskProject not found" });

    return res.json({ message: "RiskProject updated ✅", project: updated });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * DELETE /api/risk-data/projects/:id
 * ADMIN only
 */
const deleteProject = async (req, res) => {
  try {
    const deleted = await RiskProject.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "RiskProject not found" });

    return res.json({ message: "RiskProject deleted ✅" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createProject,
  listProjects,
  getProjectById,
  updateProject,
  deleteProject,
};