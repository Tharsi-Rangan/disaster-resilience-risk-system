// backend/src/services/assessment.service.js

const RiskAssessment = require("../models/RiskAssessment");
const RiskSnapshot = require("../models/RiskSnapshot");
const Project = require("../models/Project");
const { getElevation } = require("./elevation.service");

const clamp = (n) => Math.max(0, Math.min(100, Number(n || 0)));

// Risk level thresholds (viva-friendly)
function levelFromScore(score) {
  if (score >= 70) return "HIGH";
  if (score >= 40) return "MEDIUM";
  return "LOW";
}

// Weather score from Component 2 snapshot fields
function calcWeatherScore(snapshot) {
  const rain = Number(snapshot.rainfall || 0);
  const wind = Number(snapshot.windSpeed || 0);

  // Normalize into 0..100
  const rainScore = clamp((rain / 50) * 100); // 50mm => 100
  const windScore = clamp((wind / 25) * 100); // 25 m/s => 100

  return clamp(Math.round(rainScore * 0.6 + windScore * 0.4));
}

// Earthquake score from Component 2 snapshot fields
function calcEarthquakeScore(snapshot) {
  const count = Number(snapshot.earthquakeCount || 0);
  // 0 quakes => 0, 10+ quakes => 100 (simple mapping)
  return clamp(Math.round((count / 10) * 100));
}

// Flood score base comes from Component 2 floodRiskIndex (0..100)
function calcFloodBase(snapshot) {
  return clamp(snapshot.floodRiskIndex || 0);
}

// Elevation adjustment (3rd-party) for flood risk
function adjustFloodByElevation(floodBase, elevation) {
  if (typeof elevation !== "number") return clamp(floodBase);

  let bonus = 0;
  if (elevation < 20) bonus = 15;
  else if (elevation < 100) bonus = 8;

  return clamp(Math.round(floodBase + bonus));
}

async function findLatestSnapshot(projectId) {
  return RiskSnapshot.findOne({ projectId }).sort({ createdAt: -1 });
}

// Keep OFF by default to avoid conflict with “Status Update” component
async function updateProjectStatus(projectId, riskLevel) {
  await Project.findByIdAndUpdate(projectId, { status: riskLevel });
}

exports.runForProject = async (projectId) => {
  const snapshot = await findLatestSnapshot(projectId);
  if (!snapshot) {
    const err = new Error("Latest RiskSnapshot not found for project");
    err.statusCode = 400;
    throw err;
  }

  // Get Project location for elevation (snapshot doesn't store lat/lng)
  const project = await Project.findById(projectId).select("location");
  if (!project) {
    const err = new Error("Project not found");
    err.statusCode = 404;
    throw err;
  }

  const lat = project?.location?.lat;
  const lng = project?.location?.lng;

  const hasCoords =
    typeof lat === "number" &&
    typeof lng === "number" &&
    !(lat === 0 && lng === 0);

  const elevation = hasCoords ? await getElevation(lat, lng) : null;

  // Subscores from Component 2 snapshot fields
  const weatherScore = calcWeatherScore(snapshot);
  const earthquakeScore = calcEarthquakeScore(snapshot);

  const floodBase = calcFloodBase(snapshot);
  const floodScore = adjustFloodByElevation(floodBase, elevation);

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

  // ✅ Keep disabled to avoid overlap with the separate status module
  // await updateProjectStatus(projectId, riskLevel);

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