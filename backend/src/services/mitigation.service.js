const { geminiGenerateMitigation } = require("./ai/gemini.service");
const RiskAssessment = require("../models/RiskAssessment");

const normalizeRecommendations = (recs = []) => {
  return recs.map((r) => ({
    title: r.title,
    details: r.details,
    category: r.category || "GENERAL",
    status: "PENDING",
  }));
};

const buildMitigationPlan = async (assessmentData) => {
  const { riskLevel, riskScore, floodScore, earthquakeScore, weatherScore, locationContext, weatherContext, customFocus } = assessmentData;

  const provider = (process.env.AI_PROVIDER || "NONE").toUpperCase();

  // 1) Try AI first (if enabled)
  if (provider === "GEMINI") {
    try {
      const ai = await geminiGenerateMitigation({ riskLevel, riskScore, floodScore, earthquakeScore, weatherScore, locationContext, weatherContext, customFocus });

      return {
        priorityLevel: ai.priorityLevel || riskLevel,
        recommendations: normalizeRecommendations(ai.recommendations),
        aiProvider: "GEMINI",
      };
    } catch (err) {
      // fallback will handle it
      console.log("Gemini failed, falling back to rule-based:", err.message);
    }
  }

  // 2) Fallback: rule-based logic (always works)
  const recommendations = [];

  if (floodScore > 20) {
    recommendations.push({
      title: "Improve Drainage System",
      details: "Install additional stormwater channels and flood barriers.",
      category: "FLOOD",
      status: "PENDING",
    });
  }

  if (earthquakeScore > 20) {
    recommendations.push({
      title: "Reinforce Structural Design",
      details: "Use earthquake-resistant materials and structural reinforcements.",
      category: "EARTHQUAKE",
      status: "PENDING",
    });
  }

  if (weatherScore > 15) {
    recommendations.push({
      title: "Weatherproof Infrastructure",
      details: "Use weather-resistant materials and protective coatings.",
      category: "WEATHER",
      status: "PENDING",
    });
  }

  const fallbacks = [
    { title: "General Risk Monitoring", details: "Continue periodic monitoring and preventive maintenance.", category: "GENERAL", status: "PENDING" },
    { title: "Emergency Response Plan", details: "Establish clear evacuation routes and emergency contacts.", category: "GENERAL", status: "PENDING" },
    { title: "Staff Safety Training", details: "Conduct regular safety drills for all on-site personnel.", category: "GENERAL", status: "PENDING" },
    { title: "Equipment Inspection", details: "Check and maintain all protective gear and machinery.", category: "GENERAL", status: "PENDING" },
    { title: "Material Securing", details: "Ensure loose materials are tied down to prevent damage.", category: "GENERAL", status: "PENDING" }
  ];

  for (let item of fallbacks) {
    if (recommendations.length < 5) {
      recommendations.push(item);
    }
  }

  return {
    priorityLevel: riskLevel,
    recommendations,
    aiProvider: "NONE",
  };
};

module.exports = { buildMitigationPlan };