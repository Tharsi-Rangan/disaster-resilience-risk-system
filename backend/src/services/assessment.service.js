function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function toLevel(score) {
  if (score >= 70) return "HIGH";
  if (score >= 40) return "MEDIUM";
  return "LOW";
}

// Simple + explainable in viva
function computeScores({ weatherScore = 0, floodScore = 0, earthquakeScore = 0 }) {
  const w = clamp(Number(weatherScore) || 0, 0, 100);
  const f = clamp(Number(floodScore) || 0, 0, 100);
  const e = clamp(Number(earthquakeScore) || 0, 0, 100);

  const riskScore = Math.round(w * 0.4 + f * 0.4 + e * 0.2);
  const riskLevel = toLevel(riskScore);

  return { weatherScore: w, floodScore: f, earthquakeScore: e, riskScore, riskLevel };
}

module.exports = { computeScores };