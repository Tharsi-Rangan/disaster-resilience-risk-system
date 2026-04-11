const { validationResult } = require("express-validator");
const riskDataService = require("../services/riskData.service");
const Project = require("../models/Project");

/**
 * POST /api/risk-data/fetch/:projectId
 * Body: { lat, lng }
 * If lat/lng not provided, it will use Project location by projectId.
 */
const fetchRiskData = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { projectId } = req.params;
    let { lat, lng } = req.body;

    // Fallback to real Project location
    if (lat === undefined || lng === undefined) {
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      lat = project.location?.lat;
      lng = project.location?.lng;

      if (lat === undefined || lng === undefined) {
        return res.status(400).json({ message: "Project location is missing" });
      }
    }

    const snapshot = await riskDataService.createSnapshot({ projectId, lat, lng });

    return res.status(201).json({
      message: "Risk data fetched ✅",
      snapshot,
    });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
};

/**
 * GET /api/risk-data/:projectId/latest
 */
const getLatest = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const snapshot = await riskDataService.getLatestSnapshot(projectId);
    if (!snapshot) {
      return res.status(404).json({ message: "No snapshots found" });
    }

    return res.json({ snapshot });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/risk-data/:projectId/history
 */
const getHistory = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const history = await riskDataService.getSnapshotHistory(projectId);

    return res.json({
      count: history.length,
      history,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * DELETE /api/risk-data/:snapshotId
 */
const removeSnapshot = async (req, res) => {
  try {
    const { snapshotId } = req.params;

    const deleted = await riskDataService.deleteSnapshot(snapshotId);
    if (!deleted) {
      return res.status(404).json({ message: "Snapshot not found" });
    }

    return res.json({ message: "Snapshot deleted ✅" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  fetchRiskData,
  getLatest,
  getHistory,
  removeSnapshot,
};