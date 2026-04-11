const { validationResult } = require("express-validator");
const riskDataService = require("../services/riskData.service");

/*  NEWLY ADDED */
const Project = require("../models/Project");


/**
 * POST /api/risk-data/fetch/:projectId
 * Body: { lat, lng } 
 * If lat/lng not provided, it will use Project location by projectId.
 */
const fetchRiskData = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { projectId } = req.params;

    /* : fallback to project location */
    let { lat, lng } = req.body;

    if (lat === undefined || lng === undefined) {
      const project = await Project.findById(projectId);
      if (!project) return res.status(404).json({ message: "Project not found" });

      lat = project.location?.lat;
      lng = project.location?.lng;

      if (lat === undefined || lng === undefined) {
        return res.status(400).json({ message: "Project location is missing" });
      }
    }

    // Optional earthquake metadata (with safe defaults)
    const earthquakeWindowDays = req.body.earthquakeWindowDays;
    const earthquakeRadiusKm = req.body.earthquakeRadiusKm;
    const minEarthquakeMagnitude = req.body.minEarthquakeMagnitude;

    const snapshot = await riskDataService.createSnapshot({ 
      projectId, 
      lat, 
      lng,
      earthquakeWindowDays,
      earthquakeRadiusKm,
      minEarthquakeMagnitude,
    });

    return res.status(201).json({ message: "Risk data fetched ✅", snapshot });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
};

const getLatest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { projectId } = req.params;
    const snapshot = await riskDataService.getLatestSnapshot(projectId);
    if (!snapshot) return res.status(404).json({ message: "No snapshots found" });

    return res.json({ snapshot });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { projectId } = req.params;
    const history = await riskDataService.getSnapshotHistory(projectId);
    return res.json({ count: history.length, history });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const removeSnapshot = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { snapshotId } = req.params;
    const deleted = await riskDataService.deleteSnapshot(snapshotId);
    if (!deleted) return res.status(404).json({ message: "Snapshot not found" });

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