const MitigationPlan = require("../models/MitigationPlan");
const { buildMitigationPlan } = require("../services/mitigation.service");

// POST /api/mitigation/generate/:projectId
const generateMitigationPlan = async (req, res) => {
  try {
    const { projectId } = req.params;

    // 1) basic validation
    if (!projectId) {
      return res.status(400).json({ message: "projectId is required" });
    }

    // 2) For now, use a mock assessment (until Assessment component is ready)
    // Later: replace this with DB query for latest RiskAssessment by projectId
    const mockAssessment = {
      riskLevel: "HIGH",
      riskScore: 82,
      floodScore: 30,
      earthquakeScore: 40,
      weatherScore: 12,
    };

    // 3) Generate mitigation recommendations (rule-based)
    const planData = await buildMitigationPlan(mockAssessment);

    // 4) Save to DB
    const created = await MitigationPlan.create({
      projectId,
      assessmentId: null, // later will link to real assessment
      priorityLevel: planData.priorityLevel,
      recommendations: planData.recommendations,
      createdBy: req.user._id, // from auth middleware
      aiProvider: planData.aiProvider || "NONE",
      promptVersion: "v1",
    });

    // 5) Respond
    return res.status(201).json({
      message: "Mitigation plan generated successfully ✅",
      mitigationPlan: created,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { generateMitigationPlan };