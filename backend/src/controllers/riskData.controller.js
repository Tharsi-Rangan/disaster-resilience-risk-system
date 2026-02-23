const { validationResult } = require("express-validator");
const riskDataService = require("../services/riskData.service");

/**
 * POST /api/risk-data/fetch/:projectId
 * Body: { lat, lng }  (until Project module is ready)
 */
const fetchRiskData = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { projectId } = req.params;
    const { lat, lng } = req.body;

    const snapshot = await riskDataService.createSnapshot({ projectId, lat, lng });
    return res.status(201).json({ message: "Risk data fetched ✅", snapshot });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
};

const getLatest = async (req, res) => {
  try {
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
    const { projectId } = req.params;
    const history = await riskDataService.getSnapshotHistory(projectId);
    return res.json({ count: history.length, history });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const removeSnapshot = async (req, res) => {
  try {
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