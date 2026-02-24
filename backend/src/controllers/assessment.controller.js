const mongoose = require("mongoose");
const RiskAssessment = require("../models/RiskAssessment");

// Helper function
function computeRisk(weatherScore, floodScore, earthquakeScore) {
  const w = Number(weatherScore);
  const f = Number(floodScore);
  const e = Number(earthquakeScore);

  const riskScore = Math.round((w + f + e) / 3);

  let riskLevel = "LOW";
  if (riskScore >= 70) riskLevel = "HIGH";
  else if (riskScore >= 40) riskLevel = "MEDIUM";

  return { riskScore, riskLevel };
}

// ✅ CREATE
exports.runAssessment = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!mongoose.isValidObjectId(projectId)) {
      return res.status(400).json({ message: "Invalid projectId" });
    }

    const { weatherScore = 0, floodScore = 0, earthquakeScore = 0 } = req.body;

    const { riskScore, riskLevel } = computeRisk(
      weatherScore,
      floodScore,
      earthquakeScore
    );

    const created = await RiskAssessment.create({
      projectId,
      weatherScore,
      floodScore,
      earthquakeScore,
      riskScore,
      riskLevel,
    });

    return res.status(201).json(created);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ GET LATEST
exports.getLatest = async (req, res) => {
  try {
    const { projectId } = req.params;

    const latest = await RiskAssessment.findOne({ projectId })
      .sort({ createdAt: -1 });

    return res.json(latest);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ GET HISTORY
exports.getHistory = async (req, res) => {
  try {
    const { projectId } = req.params;

    const history = await RiskAssessment.find({ projectId })
      .sort({ createdAt: -1 });

    return res.json(history);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ GET ONE
exports.getOne = async (req, res) => {
  try {
    const item = await RiskAssessment.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });

    return res.json(item);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ UPDATE
exports.updateOne = async (req, res) => {
  try {
    const { weatherScore, floodScore, earthquakeScore } = req.body;

    const existing = await RiskAssessment.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Not found" });

    const ws = weatherScore ?? existing.weatherScore;
    const fs = floodScore ?? existing.floodScore;
    const es = earthquakeScore ?? existing.earthquakeScore;

    const { riskScore, riskLevel } = computeRisk(ws, fs, es);

    const updated = await RiskAssessment.findByIdAndUpdate(
      req.params.id,
      {
        weatherScore: ws,
        floodScore: fs,
        earthquakeScore: es,
        riskScore,
        riskLevel,
      },
      { new: true }
    );

    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ DELETE
exports.deleteOne = async (req, res) => {
  try {
    const deleted = await RiskAssessment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });

    return res.json({ message: "Deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};