const RiskAssessment = require("../models/RiskAssessment");
const RiskSnapshot = require("../models/RiskSnapshot");
const Project = require("../models/Project");
const { getElevation } = require("./elevation.service");

const {
  levelFromScore,
  calcWeatherScore,
  calcEarthquakeScore,
  calcFloodBase,
  adjustFloodByElevation,
  calcRiskScore,
} = require("../utils/assessment.calc");

async function findLatestSnapshot(projectId) {
  return RiskSnapshot.findOne({ projectId }).sort({ createdAt: -1 });
}

// Keep available, but disabled for now if another component owns project status
async function updateProjectStatus(projectId, riskLevel) {
  await Project.findByIdAndUpdate(projectId, { status: riskLevel });
}

exports.runForProject = async (projectId) => {
  console.log("RUN assessment for projectId:", projectId);

  const snapshot = await findLatestSnapshot(projectId);

  if (!snapshot) {
    const err = new Error("Latest RiskSnapshot not found for project");
    err.statusCode = 400;
    throw err;
  }

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

  const elevation =
    hasCoords && snapshot.elevation == null
      ? await getElevation(lat, lng)
      : snapshot.elevation ?? null;

  const weatherScore = calcWeatherScore(snapshot);
  const earthquakeScore = calcEarthquakeScore(snapshot);
  const floodBase = calcFloodBase(snapshot);
  const floodScore = adjustFloodByElevation(floodBase, elevation);

  const riskScore = calcRiskScore({
    weatherScore,
    floodScore,
    earthquakeScore,
  });

  const riskLevel = levelFromScore(riskScore);

  const created = await RiskAssessment.create({
    projectId,
    snapshotId: snapshot._id,
    riskScore,
    riskLevel,
    weatherScore,
    earthquakeScore,
    floodBase,
    floodScore,
    elevation,
    modelVersion: "v1",
  });

  return {
    created,
    usedSnapshot: snapshot._id,
    elevation,
    floodBase,
  };
};

exports.getLatest = async (projectId) => {
  return RiskAssessment.findOne({ projectId })
    .sort({ createdAt: -1 })
    .populate("snapshotId");
};

exports.getHistory = async (projectId, limit = 50) => {
  return RiskAssessment.find({ projectId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("snapshotId");
};

exports.deleteOne = async (id) => {
  return RiskAssessment.findByIdAndDelete(id);
};