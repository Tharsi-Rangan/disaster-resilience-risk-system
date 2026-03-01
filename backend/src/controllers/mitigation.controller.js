const MitigationPlan = require("../models/MitigationPlan");
const { buildMitigationPlan } = require("../services/mitigation.service");

// POST /api/mitigation/generate/:projectId
const generateMitigationPlan = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({ message: "projectId is required" });
    }

    const mockAssessment = {
      riskLevel: "HIGH",
      riskScore: 82,
      floodScore: 30,
      earthquakeScore: 40,
      weatherScore: 12,
    };

    const planData = await buildMitigationPlan(mockAssessment);

    const created = await MitigationPlan.create({
      projectId,
      assessmentId: null,
      priorityLevel: planData.priorityLevel,
      recommendations: planData.recommendations,
      createdBy: req.user._id,
      aiProvider: planData.aiProvider || "NONE",
      promptVersion: "v1",
    });

    return res.status(201).json({
      message: "Mitigation plan generated successfully ✅",
      mitigationPlan: created,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// GET /api/mitigation/:projectId/latest
const getLatestMitigationPlan = async (req, res) => {
  try {
    const { projectId } = req.params;

    const latest = await MitigationPlan.findOne({ projectId }).sort({ createdAt: -1 });

    if (!latest) {
      return res.status(404).json({ message: "No mitigation plan found for this project" });
    }

    return res.json({
      message: "Latest mitigation plan retrieved successfully ✅",
      mitigationPlan: latest,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// GET /api/mitigation/:projectId/history
const getMitigationHistory = async (req, res) => {
  try {
    const { projectId } = req.params;

    const plans = await MitigationPlan.find({ projectId }).sort({ createdAt: -1 });

    return res.json({
      message: "Mitigation history retrieved successfully ✅",
      count: plans.length,
      mitigationPlans: plans,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// DELETE /api/mitigation/:id
const deleteMitigationPlan = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await MitigationPlan.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Mitigation plan not found" });
    }

    return res.json({
      message: "Mitigation plan deleted successfully ✅",
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  generateMitigationPlan,
  getLatestMitigationPlan,
  getMitigationHistory,
  deleteMitigationPlan
};