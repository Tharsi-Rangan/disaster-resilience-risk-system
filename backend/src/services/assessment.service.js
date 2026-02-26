const RiskAssessment = require("../models/RiskAssessment");
const RiskSnapshot = require("../models/RiskSnapshot");
const Project = require("../models/Project");
const { getElevation } = require("./elevation.service");

const clamp = (n) => Math.max(0, Math.min(100, Number(n || 0)));

function levelFromScore(score) {
  if (score >= 70) return "HIGH";
  if (score >= 40) return "MEDIUM";
  return "LOW";
}

// Sub-score formulas (simple + explainable in viva)
function calcWeatherScore(snapshot) {
  // rainfall + wind → risk
  const rain = Number(snapshot.rainfallMm || 0);
  const wind = Number(snapshot.windSpeedMs || 0);

  // Normalize into 0..100
  const rainScore = clamp((rain / 50) * 100); // 50mm => 100
  const windScore = clamp((wind / 25) * 100); // 25 m/s => 100

  return clamp(Math.round(rainScore * 0.6 + windScore * 0.4));
}

function calcEarthquakeScore(snapshot) {
  // If snapshot has earthquakeIndex, use it. Else keep small default.
  return clamp(snapshot.earthquakeIndex || 10);
}

function adjustFloodByElevation(floodBase, elevation) {
  if (typeof elevation !== "number") return clamp(floodBase);

  // low elevation => higher flood risk
  let bonus = 0;
  if (elevation < 20) bonus = 15;
  else if (elevation < 100) bonus = 8;

  return clamp(Math.round(floodBase + bonus));
}

async function findLatestSnapshot(projectId) {
  return RiskSnapshot.findOne({ projectId }).sort({ createdAt: -1 });
}

async function updateProjectStatus(projectId, riskLevel) {
  // only Assessment service does this (your rule)
  if (!Project) return;
  await Project.findByIdAndUpdate(projectId, { status: riskLevel });
}

exports.runForProject = async (projectId) => {
  const snapshot = await findLatestSnapshot(projectId);
  if (!snapshot) {
    const err = new Error("Latest RiskSnapshot not found for project");
    err.statusCode = 400;
    throw err;
  }

  // Flood base from snapshot
  const floodBase = clamp(snapshot.floodLikelihood || 0);

  // Third-party elevation
  const elevation = await getElevation(snapshot.lat, snapshot.lng);
  const floodScore = adjustFloodByElevation(floodBase, elevation);

  // Other subscores
  const weatherScore = calcWeatherScore(snapshot);
  const earthquakeScore = calcEarthquakeScore(snapshot);

  // Weighted total (30/40/30)
  const riskScore = clamp(
    Math.round(weatherScore * 0.3 + floodScore * 0.4 + earthquakeScore * 0.3)
  );

  const riskLevel = levelFromScore(riskScore);

  const created = await RiskAssessment.create({
    projectId,
    snapshotId: snapshot._id,
    riskScore,
    riskLevel,
    weatherScore,
    floodScore,
    earthquakeScore,
    modelVersion: "v1",
  });

  // Optional project status update
  await updateProjectStatus(projectId, riskLevel);

  return { created, usedSnapshot: snapshot._id, elevation };
};

exports.getLatest = async (projectId) => {
  return RiskAssessment.findOne({ projectId }).sort({ createdAt: -1 });
};

exports.getHistory = async (projectId, limit = 50) => {
  return RiskAssessment.find({ projectId }).sort({ createdAt: -1 }).limit(limit);
};

exports.deleteOne = async (id) => {
  return RiskAssessment.findByIdAndDelete(id);
};