/*
  This service is responsible for generating
  mitigation recommendations based on risk level.
*/

const buildMitigationPlan = async (assessmentData) => {
  const { riskLevel, floodScore, earthquakeScore, weatherScore } = assessmentData;

  const recommendations = [];

  /*
    Rule-based logic:
    If risk is HIGH → stronger actions
    If MEDIUM → moderate actions
    If LOW → preventive actions
  */

  // FLOOD mitigation
  if (floodScore > 20) {
    recommendations.push({
      title: "Improve Drainage System",
      details: "Install additional stormwater channels and flood barriers.",
      category: "FLOOD",
      status: "PENDING",
    });
  }

  // EARTHQUAKE mitigation
  if (earthquakeScore > 20) {
    recommendations.push({
      title: "Reinforce Structural Design",
      details: "Use earthquake-resistant materials and structural reinforcements.",
      category: "EARTHQUAKE",
      status: "PENDING",
    });
  }

  // WEATHER mitigation
  if (weatherScore > 15) {
    recommendations.push({
      title: "Weatherproof Infrastructure",
      details: "Use weather-resistant materials and protective coatings.",
      category: "WEATHER",
      status: "PENDING",
    });
  }

  // General fallback if no specific risks
  if (recommendations.length === 0) {
    recommendations.push({
      title: "General Risk Monitoring",
      details: "Continue periodic monitoring and preventive maintenance.",
      category: "GENERAL",
      status: "PENDING",
    });
  }

  return {
    priorityLevel: riskLevel,
    recommendations,
    aiProvider: "NONE",
  };
};

module.exports = { buildMitigationPlan };