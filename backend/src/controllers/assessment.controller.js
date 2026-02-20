const mongoose = require("mongoose");
const RiskAssessment = require("../models/RiskAssessment");
const { computeScores } = require("../services/assessment.service");

exports.runAssessment = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid projectId" });
    }

    // For now accept scores from body (simple demo)
    // Later you can fetch from RiskData collection if your teammate finishes it.
    const { weatherScore, floodScore, earthquakeScore, snapshotId } = req.body || {};

    const scores = computeScores({ weatherScore, floodScore, earthquakeScore });

    const created = await RiskAssessment.create({
      projectId,
      snapshotId: snapshotId && mongoose.Types.ObjectId.isValid(snapshotId) ? snapshotId : null,
      ...scores,
    });

    return res.status(201).json(created);
  } catch (err) {
    console.error("runAssessment:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getLatest = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid projectId" });
    }

    const latest = await RiskAssessment.findOne({ projectId }).sort({ createdAt: -1 });
    return res.status(200).json(latest || null);
  } catch (err) {
    console.error("getLatest:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid projectId" });
    }

    const list = await RiskAssessment.find({ projectId }).sort({ createdAt: -1 });
    return res.status(200).json(list);
  } catch (err) {
    console.error("getHistory:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.deleteOne = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid assessment id" });
    }

    const deleted = await RiskAssessment.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Assessment not found" });

    return res.status(200).json({ message: "Deleted", id });
  } catch (err) {
    console.error("deleteOne:", err);
    return res.status(500).json({ message: "Server error" });
  }
};