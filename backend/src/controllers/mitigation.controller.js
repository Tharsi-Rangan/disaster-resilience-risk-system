const MitigationPlan = require("../models/MitigationPlan");
const { buildMitigationPlan } = require("../services/mitigation.service");
const RiskAssessment = require("../models/RiskAssessment");
const Project = require("../models/Project");
const RiskSnapshot = require("../models/RiskSnapshot");

// POST /api/mitigation/generate/:projectId
const generateMitigationPlan = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { customFocus } = req.body || {};

    if (!projectId) {
      return res.status(400).json({ message: "projectId is required" });
    }
    const assessment = await RiskAssessment.findOne({ projectId }).sort({
      createdAt: -1,
    });

    if (!assessment) {
      return res.status(404).json({
        message:
          "No risk assessment found for this project. Run assessment first.",
      });
    }

    const project = await Project.findById(projectId);
    const snapshot = assessment.snapshotId ? await RiskSnapshot.findById(assessment.snapshotId) : null;

    let locationContext = null;
    if (project && project.location) {
      locationContext = `${project.location.address || 'Unknown'} (Lat: ${project.location.lat || 'N/A'}, Lng: ${project.location.lng || 'N/A'})`;
    }

    let weatherContext = null;
    if (snapshot) {
      weatherContext = `Rainfall: ${snapshot.rainfall}mm, Temp: ${snapshot.temperature}°C, Wind: ${snapshot.windSpeed}m/s, Earthquakes: ${snapshot.earthquakeCount}`;
    }

    const planData = await buildMitigationPlan({
      riskScore: assessment.riskScore,
      riskLevel: assessment.riskLevel,
      floodScore: assessment.floodScore,
      earthquakeScore: assessment.earthquakeScore,
      weatherScore: assessment.weatherScore,
      locationContext,
      weatherContext,
      customFocus,
    });

    const totalRecs = planData.recommendations.length;

    const created = await MitigationPlan.create({
      projectId,
      assessmentId: assessment._id,
      snapshotId: assessment.snapshotId || null,
      priorityLevel: planData.priorityLevel,
      planStatus: "PENDING",
      totalRecommendations: totalRecs,
      pendingCount: totalRecs,
      ongoingCount: 0,
      completedCount: 0,
      recommendations: planData.recommendations,
      createdBy: req.user._id,
      aiProvider: planData.aiProvider || "NONE",
      promptVersion: planData.promptVersion || "v1",
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

    const latest = await MitigationPlan.findOne({ projectId })
      .populate('recommendations.updatedBy', 'name role')
      .sort({ createdAt: -1 });

    if (!latest) {
      return res
        .status(404)
        .json({ message: "No mitigation plan found for this project" });
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

    const plans = await MitigationPlan.find({ projectId })
      .populate('recommendations.updatedBy', 'name role')
      .sort({ createdAt: -1 });

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

// GET /api/mitigation/all
const getAllMitigationPlans = async (req, res) => {
  try {
    const plans = await MitigationPlan.find()
      .populate("projectId", "title projectType status")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    return res.json({
      message: "All mitigation plans retrieved successfully ✅",
      count: plans.length,
      mitigationPlans: plans,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// PATCH /api/mitigation/:planId/recommendations/:recId
const updateRecommendation = async (req, res) => {
  try {
    const { planId, recId } = req.params;
    const { status, actionNote } = req.body;

    const plan = await MitigationPlan.findById(planId);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const rec = plan.recommendations.id(recId);
    if (!rec) return res.status(404).json({ message: "Recommendation not found" });

    if (status) rec.status = status;
    if (actionNote !== undefined) rec.actionNote = actionNote;
    rec.updatedBy = req.user._id;
    rec.updatedAt = new Date();

    let pending = 0, ongoing = 0, completed = 0;
    plan.recommendations.forEach((r) => {
      if (r.status === "PENDING") pending++;
      if (r.status === "ONGOING") ongoing++;
      if (r.status === "COMPLETED") completed++;
    });

    plan.pendingCount = pending;
    plan.ongoingCount = ongoing;
    plan.completedCount = completed;

    if (completed === plan.totalRecommendations && plan.totalRecommendations > 0) {
       plan.planStatus = "COMPLETED";
    } else if (ongoing > 0 || completed > 0) {
       plan.planStatus = "IN_PROGRESS";
    } else {
       plan.planStatus = "PENDING";
    }

    await plan.save();
    await plan.populate('recommendations.updatedBy', 'name role');
    return res.json({ message: "Recommendation updated successfully ✅", mitigationPlan: plan });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// DELETE /api/mitigation/:planId/recommendations/:recId
const deleteRecommendation = async (req, res) => {
  try {
    const { planId, recId } = req.params;

    const plan = await MitigationPlan.findById(planId);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const recIndex = plan.recommendations.findIndex(r => r._id.toString() === recId);
    if (recIndex === -1) return res.status(404).json({ message: "Recommendation not found" });

    plan.recommendations.splice(recIndex, 1);
    plan.totalRecommendations = plan.recommendations.length;

    let pending = 0, ongoing = 0, completed = 0;
    plan.recommendations.forEach((r) => {
      if (r.status === "PENDING") pending++;
      if (r.status === "ONGOING") ongoing++;
      if (r.status === "COMPLETED") completed++;
    });

    plan.pendingCount = pending;
    plan.ongoingCount = ongoing;
    plan.completedCount = completed;

    if (plan.totalRecommendations === 0) {
      plan.planStatus = "COMPLETED";
    } else if (completed === plan.totalRecommendations) {
       plan.planStatus = "COMPLETED";
    } else if (ongoing > 0 || completed > 0) {
       plan.planStatus = "IN_PROGRESS";
    } else {
       plan.planStatus = "PENDING";
    }

    await plan.save();
    await plan.populate('recommendations.updatedBy', 'name role');
    return res.json({ message: "Recommendation deleted successfully ✅", mitigationPlan: plan });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  generateMitigationPlan,
  getLatestMitigationPlan,
  getMitigationHistory,
  deleteMitigationPlan,
  getAllMitigationPlans,
  updateRecommendation,
  deleteRecommendation
};
