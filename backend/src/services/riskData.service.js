const axios = require("axios");
const RiskSnapshot = require("../models/RiskSnapshot");
const { fetchOpenWeather } = require("./weather.service");

// optional helper: simple flood index heuristic
function computeFloodRiskIndex({ rainfall, humidity, cloudiness }) {
  // very simple heuristic 0-100 (acceptable for component 2)
  // rainfall has highest weight
  const rainScore = Math.min(rainfall * 20, 100); // 5mm => 100
  const humidityScore = Math.min((humidity / 100) * 30, 30);
  const cloudScore = Math.min((cloudiness / 100) * 20, 20);

  const total = rainScore * 0.6 + humidityScore + cloudScore;
  return Math.round(Math.min(total, 100));
}

async function fetchEarthquakeCount({ lat, lng }) {
  // USGS past 30 days, radius ~200km (tweak if needed)
  const end = new Date();
  const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const format = (d) => d.toISOString().split("T")[0];

  const url = "https://earthquake.usgs.gov/fdsnws/event/1/query";
  const { data } = await axios.get(url, {
    params: {
      format: "geojson",
      starttime: format(start),
      endtime: format(end),
      latitude: lat,
      longitude: lng,
      maxradiuskm: 200,
      minmagnitude: 3,
    },
    timeout: 10000,
  });

  return data?.metadata?.count ?? (data?.features?.length ?? 0);
}

// prevent spamming fetch (cooldown)
async function canFetchNow(projectId, cooldownMinutes = 5) {
  const latest = await RiskSnapshot.findOne({ projectId }).sort({ fetchedAt: -1 });
  if (!latest) return true;

  const diffMs = Date.now() - new Date(latest.fetchedAt).getTime();
  const diffMin = diffMs / 1000 / 60;
  return diffMin >= cooldownMinutes;
}

async function createSnapshot({ projectId, lat, lng }) {
  const allowed = await canFetchNow(projectId, Number(process.env.RISK_FETCH_COOLDOWN_MIN || 5));
  if (!allowed) {
    const err = new Error("Fetch cooldown active. Try again later.");
    err.statusCode = 429;
    throw err;
  }

  const weather = await fetchOpenWeather({ lat, lng });
  const earthquakeCount = await fetchEarthquakeCount({ lat, lng });

  const floodRiskIndex = computeFloodRiskIndex({
    rainfall: weather.rainfall,
    humidity: weather.humidity,
    cloudiness: weather.cloudiness,
  });

  const snapshot = await RiskSnapshot.create({
    projectId,
    ...weather,
    earthquakeCount,
    floodRiskIndex,
    fetchedAt: new Date(),
    source: "OpenWeather/USGS",
  });

  return snapshot;
}

async function getLatestSnapshot(projectId) {
  return RiskSnapshot.findOne({ projectId }).sort({ fetchedAt: -1 });
}

async function getSnapshotHistory(projectId) {
  return RiskSnapshot.find({ projectId }).sort({ fetchedAt: -1 });
}

async function deleteSnapshot(snapshotId) {
  return RiskSnapshot.findByIdAndDelete(snapshotId);
}

module.exports = {
  createSnapshot,
  getLatestSnapshot,
  getSnapshotHistory,
  deleteSnapshot,
};