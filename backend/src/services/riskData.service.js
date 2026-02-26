const axios = require("axios");
const RiskSnapshot = require("../models/RiskSnapshot");
const { fetchOpenWeather } = require("./weather.service");

// optional helper: simple flood index heuristic (0 - 100)
// NOTE: This is NOT Component 3 scoring engine.
function computeFloodRiskIndex({ rainfall = 0, humidity = 0, cloudiness = 0 }) {
  const rainScore = Math.min(rainfall * 20, 100); // 5mm => 100
  const humidityScore = Math.min((humidity / 100) * 30, 30);
  const cloudScore = Math.min((cloudiness / 100) * 20, 20);

  const total = rainScore * 0.6 + humidityScore + cloudScore;
  return Math.round(Math.min(total, 100));
}

async function fetchEarthquakeCount({ lat, lng }) {
  // USGS past 30 days, radius ~200km
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
    timeout: 20000, // increased timeout to reduce failures
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
  // Safety validation (in case controller didn’t pass proper values)
  if (typeof lat !== "number" || typeof lng !== "number") {
    const err = new Error("Valid lat/lng required to fetch risk data");
    err.statusCode = 400;
    throw err;
  }

  // cooldown interval from env (matches your .env key)
  const cooldown = Number(process.env.RISKDATA_MIN_FETCH_INTERVAL_MIN || 5);
  const allowed = await canFetchNow(projectId, cooldown);

  if (!allowed) {
    const err = new Error("Fetch cooldown active. Try again later.");
    err.statusCode = 429;
    throw err;
  }

  // Weather (OpenWeather or fallback provider depending on your weather.service.js)
  const weather = await fetchOpenWeather({ lat, lng });

  // Earthquake count (fallback to 0 if USGS is down)
  let earthquakeCount = 0;
  try {
    earthquakeCount = await fetchEarthquakeCount({ lat, lng });
  } catch (e) {
    earthquakeCount = 0;
  }

  const floodRiskIndex = computeFloodRiskIndex({
    rainfall: weather?.rainfall ?? 0,
    humidity: weather?.humidity ?? 0,
    cloudiness: weather?.cloudiness ?? 0,
  });

  const snapshot = await RiskSnapshot.create({
    projectId,
    rainfall: weather?.rainfall ?? 0,
    windSpeed: weather?.windSpeed ?? 0,
    temperature: weather?.temperature ?? 0,
    humidity: weather?.humidity ?? 0,
    cloudiness: weather?.cloudiness ?? 0,

    earthquakeCount,
    floodRiskIndex,
    fetchedAt: new Date(),

    // show which weather provider was used (good for viva)
    source: `${weather?.source || "OpenWeather"}/USGS`,
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

  // optional export (useful for unit tests)
  computeFloodRiskIndex,
};