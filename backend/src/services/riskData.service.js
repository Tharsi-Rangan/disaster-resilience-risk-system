const axios = require("axios");
const RiskSnapshot = require("../models/RiskSnapshot");
const { fetchOpenWeather } = require("./weather.service");

// optional helper: simple flood index heuristic (0 - 100)
// NOTE: This is NOT Component 3 scoring engine.
function computeFloodRiskIndex({ rainfall = 0, humidity = 0, cloudiness = 0, riverDischarge = null }) {
  const rainScore = Math.min(rainfall * 20, 100); // 5mm => 100
  const humidityScore = Math.min((humidity / 100) * 30, 30);
  const cloudScore = Math.min((cloudiness / 100) * 20, 20);
  const riverDischargeScore =
    riverDischarge == null
      ? 0
      : Math.min((Math.max(riverDischarge, 0) / 300) * 25, 25);

  const total = rainScore * 0.55 + humidityScore + cloudScore + riverDischargeScore;
  return Math.round(Math.min(total, 100));
}

function haversineDistanceKm(lat1, lng1, lat2, lng2) {
  const toRadians = (deg) => (deg * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

async function fetchEarthquakeCount({ lat, lng, windowDays = 30, radiusKm = 200, minMagnitude = 3 }) {
  // USGS query with configurable parameters
  const end = new Date();
  const start = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

  const format = (d) => d.toISOString().split("T")[0];

  const url = "https://earthquake.usgs.gov/fdsnws/event/1/query";
  const { data } = await axios.get(url, {
    params: {
      format: "geojson",
      starttime: format(start),
      endtime: format(end),
      latitude: lat,
      longitude: lng,
      maxradiuskm: radiusKm,
      minmagnitude: minMagnitude,
    },
    timeout: 20000, // increased timeout to reduce failures
  });

  const features = Array.isArray(data?.features) ? data.features : [];
  const count = data?.metadata?.count ?? features.length;

  let maxMagnitude = null;
  let nearestDistanceKm = null;

  for (const feature of features) {
    const magnitude = Number(feature?.properties?.mag);
    if (Number.isFinite(magnitude)) {
      maxMagnitude = maxMagnitude === null ? magnitude : Math.max(maxMagnitude, magnitude);
    }

    const coordinates = feature?.geometry?.coordinates;
    if (Array.isArray(coordinates) && coordinates.length >= 2) {
      const quakeLng = Number(coordinates[0]);
      const quakeLat = Number(coordinates[1]);

      if (Number.isFinite(quakeLat) && Number.isFinite(quakeLng)) {
        const distance = haversineDistanceKm(lat, lng, quakeLat, quakeLng);
        nearestDistanceKm = nearestDistanceKm === null ? distance : Math.min(nearestDistanceKm, distance);
      }
    }
  }

  return {
    count,
    maxMagnitude,
    nearestDistanceKm,
  };
}

async function fetchFloodHazardData({ lat, lng }) {
  const url = process.env.OPEN_METEO_FLOOD_BASE_URL || "https://flood-api.open-meteo.com/v1/flood";
  const { data } = await axios.get(url, {
    params: {
      latitude: lat,
      longitude: lng,
      daily: "river_discharge",
    },
    timeout: 20000,
  });

  const dischargeSeries = Array.isArray(data?.daily?.river_discharge) ? data.daily.river_discharge : [];
  const validValues = dischargeSeries
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));

  const riverDischarge =
    validValues.length > 0 ? Number(validValues[validValues.length - 1].toFixed(2)) : null;
  const riverDischargeMean =
    validValues.length > 0
      ? Number((validValues.reduce((sum, value) => sum + value, 0) / validValues.length).toFixed(2))
      : null;

  return {
    riverDischarge,
    riverDischargeMean,
  };
}

// prevent spamming fetch (cooldown)
async function canFetchNow(projectId, cooldownMinutes = 5) {
  const latest = await RiskSnapshot.findOne({ projectId }).sort({ fetchedAt: -1 });
  if (!latest) return true;

  const diffMs = Date.now() - new Date(latest.fetchedAt).getTime();
  const diffMin = diffMs / 1000 / 60;
  return diffMin >= cooldownMinutes;
}

async function createSnapshot({ projectId, lat, lng, earthquakeWindowDays, earthquakeRadiusKm, minEarthquakeMagnitude }) {
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

  // Earthquake count with configurable parameters (fallback to 0 if USGS is down)
  let earthquakeCount = 0;
  let maxEarthquakeMagnitude = null;
  let nearestEarthquakeDistanceKm = null;
  let earthquakeSourceStatus = "ok";
  try {
    const earthquakeData = await fetchEarthquakeCount({ 
      lat, 
      lng,
      windowDays: earthquakeWindowDays,
      radiusKm: earthquakeRadiusKm,
      minMagnitude: minEarthquakeMagnitude,
    });
    earthquakeCount = earthquakeData.count;
    maxEarthquakeMagnitude =
      earthquakeData.maxMagnitude === null ? null : Number(earthquakeData.maxMagnitude.toFixed(2));
    nearestEarthquakeDistanceKm =
      earthquakeData.nearestDistanceKm === null ? null : Number(earthquakeData.nearestDistanceKm.toFixed(2));
  } catch (e) {
    earthquakeCount = 0;
    maxEarthquakeMagnitude = null;
    nearestEarthquakeDistanceKm = null;
    earthquakeSourceStatus = "failed";
  }

  let riverDischarge = null;
  let riverDischargeMean = null;
  let floodSourceStatus = "ok";
  try {
    const floodData = await fetchFloodHazardData({ lat, lng });
    riverDischarge = floodData.riverDischarge;
    riverDischargeMean = floodData.riverDischargeMean;
  } catch (e) {
    riverDischarge = null;
    riverDischargeMean = null;
    floodSourceStatus = "failed";
  }

  const floodRiskIndex = computeFloodRiskIndex({
    rainfall: weather?.rainfall ?? 0,
    humidity: weather?.humidity ?? 0,
    cloudiness: weather?.cloudiness ?? 0,
    riverDischarge,
  });

  const snapshot = await RiskSnapshot.create({
    projectId,
    rainfall: weather?.rainfall ?? 0,
    windSpeed: weather?.windSpeed ?? 0,
    temperature: weather?.temperature ?? 0,
    humidity: weather?.humidity ?? 0,
    cloudiness: weather?.cloudiness ?? 0,
    pressure: weather?.pressure ?? null, // hPa
    visibility: weather?.visibility ?? null, // meters
    weatherCode: weather?.weatherCode ?? null, // WMO code

    earthquakeCount,
    maxEarthquakeMagnitude,
    nearestEarthquakeDistanceKm,
    earthquakeWindowDays: earthquakeWindowDays ?? 30,
    earthquakeRadiusKm: earthquakeRadiusKm ?? 200,
    minEarthquakeMagnitude: minEarthquakeMagnitude ?? 3,
    earthquakeSourceStatus,
    riverDischarge,
    riverDischargeMean,
    floodSourceStatus,
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
