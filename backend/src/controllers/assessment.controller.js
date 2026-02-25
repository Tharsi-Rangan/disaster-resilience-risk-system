const mongoose = require("mongoose");
const svc = require("../services/assessment.service");

exports.runAssessment = async (req, res) => {
  try {
    const { projectId } = req.params;
    if (!mongoose.isValidObjectId(projectId)) {
      return res.status(400).json({ message: "Invalid projectId" });
    }

    const result = await svc.runForProject(projectId);
    return res.status(201).json({
      assessment: result.created,
      meta: { snapshotId: result.usedSnapshot, elevation: result.elevation },
    });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
};

exports.getLatest = async (req, res) => {
  try {
    const { projectId } = req.params;
    const latest = await svc.getLatest(projectId);
    return res.json(latest);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const { projectId } = req.params;
    const history = await svc.getHistory(projectId);
    return res.json(history);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

exports.deleteOne = async (req, res) => {
  try {
    const deleted = await svc.deleteOne(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    return res.json({ message: "Deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};