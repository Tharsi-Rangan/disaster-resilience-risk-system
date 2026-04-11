const axios = require("axios");
const RiskSnapshot = require("../models/RiskSnapshot");
const { fetchOpenWeather } = require("./weather.service");

const OPENWEATHER_BASE =
  process.env.OPENWEATHER_BASE_URL ||
  "https://api.openweathermap.org/data/2.5/weather";

const OPEN_METEO_BASE =
  process.env.OPEN_METEO_BASE_URL ||
  "https://api.open-meteo.com/v1/forecast";

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

// Optional helper: simple flood index heuristic (0 - 100)
// NOTE: This is NOT Component 3 scoring engine.
function computeFloodRiskIndex({ rainfall = 0, humidity = 0, cloudiness = 0 }) {
  const rainScore = Math.min(rainfall * 20, 100); // 5mm => 100
  const humidityScore = Math.min((humidity / 100) * 30, 30);
  const cloudScore = Math.min((cloudiness / 100) * 20, 20);

  const total = rainScore * 0.6 + humidityScore + cloudScore;
  return Math.round(Math.min(total, 100));
}

function haversineDistanceKm(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function fetchEarthquakeStats({ lat, lng }) {
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
    timeout: 20000,
  });

  const features = Array.isArray(data?.features) ? data.features : [];
  const earthquakeCount = data?.metadata?.count ?? features.length;

  let maxEarthquakeMagnitude = null;
  let nearestEarthquakeDistanceKm = null;

  for (const feature of features) {
    const magnitude = toNumber(feature?.properties?.mag, null);

    if (
      magnitude !== null &&
      (maxEarthquakeMagnitude === null || magnitude > maxEarthquakeMagnitude)
    ) {
      maxEarthquakeMagnitude = magnitude;
    }

    const coords = feature?.geometry?.coordinates;
    const eqLng = Array.isArray(coords) ? Number(coords[0]) : NaN;
    const eqLat = Array.isArray(coords) ? Number(coords[1]) : NaN;

    if (Number.isFinite(eqLat) && Number.isFinite(eqLng)) {
      const distance = haversineDistanceKm(lat, lng, eqLat, eqLng);
      if (
        nearestEarthquakeDistanceKm === null ||
        distance < nearestEarthquakeDistanceKm
      ) {
        nearestEarthquakeDistanceKm = distance;
      }
    }
  }

  return {
    earthquakeCount,
    maxEarthquakeMagnitude,
    nearestEarthquakeDistanceKm:
      nearestEarthquakeDistanceKm === null
        ? null
        : Math.round(nearestEarthquakeDistanceKm * 100) / 100,
  };
}

async function fetchOpenWeatherExtras({ lat, lng }) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENWEATHER_API_KEY is missing in .env");
  }

  const { data } = await axios.get(OPENWEATHER_BASE, {
    params: { lat, lon: lng, appid: apiKey, units: "metric" },
    timeout: 20000,
  });

  return {
    pressure: toNumber(data?.main?.pressure, 0),
    visibility: toNumber(data?.visibility, 0),
    weatherCode: toNumber(data?.weather?.[0]?.id, null),
  };
}

async function fetchOpenMeteoExtras({ lat, lng }) {
  const { data } = await axios.get(OPEN_METEO_BASE, {
    params: {
      latitude: lat,
      longitude: lng,
      current: "surface_pressure,visibility,weather_code",
    },
    timeout: 20000,
  });

  const current = data?.current || {};
  return {
    pressure: toNumber(current.surface_pressure, 0),
    visibility: toNumber(current.visibility, 0),
    weatherCode: toNumber(current.weather_code, null),
  };
}

async function fetchWeatherExtras({ lat, lng, preferredSource }) {
  const defaults = {
    pressure: 0,
    visibility: 0,
    weatherCode: null,
  };

  try {
    if (preferredSource === "OpenMeteo") {
      return await fetchOpenMeteoExtras({ lat, lng });
    }
    return await fetchOpenWeatherExtras({ lat, lng });
  } catch (primaryErr) {
    try {
      if (preferredSource === "OpenMeteo") {
        return await fetchOpenWeatherExtras({ lat, lng });
      }
      return await fetchOpenMeteoExtras({ lat, lng });
    } catch (fallbackErr) {
      return defaults;
    }
  }
}

// Prevent spamming fetch (cooldown)
async function canFetchNow(projectId, cooldownMinutes = 5) {
  const latest = await RiskSnapshot.findOne({ projectId }).sort({ fetchedAt: -1 });
  if (!latest) return true;

  const diffMs = Date.now() - new Date(latest.fetchedAt).getTime();
  const diffMin = diffMs / 1000 / 60;
  return diffMin >= cooldownMinutes;
}

async function createSnapshot({ projectId, lat, lng }) {
  // Safety validation
  if (typeof lat !== "number" || typeof lng !== "number") {
    const err = new Error("Valid lat/lng required to fetch risk data");
    err.statusCode = 400;
    throw err;
  }

  // Cooldown interval from env
  const cooldown = Number(process.env.RISKDATA_MIN_FETCH_INTERVAL_MIN || 5);
  const allowed = await canFetchNow(projectId, cooldown);

  if (!allowed) {
    const err = new Error("Fetch cooldown active. Try again later.");
    err.statusCode = 429;
    throw err;
  }

  // Weather (OpenWeather or fallback provider)
  const weather = await fetchOpenWeather({ lat, lng });
  const weatherExtras = await fetchWeatherExtras({
    lat,
    lng,
    preferredSource: weather?.source,
  });

  // Earthquake stats (fallback to safe defaults if USGS is down)
  let earthquakeCount = 0;
  let maxEarthquakeMagnitude = null;
  let nearestEarthquakeDistanceKm = null;
  try {
    const stats = await fetchEarthquakeStats({ lat, lng });
    earthquakeCount = stats.earthquakeCount;
    maxEarthquakeMagnitude = stats.maxEarthquakeMagnitude;
    nearestEarthquakeDistanceKm = stats.nearestEarthquakeDistanceKm;
  } catch (e) {
    earthquakeCount = 0;
    maxEarthquakeMagnitude = null;
    nearestEarthquakeDistanceKm = null;
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
    pressure: weatherExtras.pressure,
    visibility: weatherExtras.visibility,
    weatherCode: weatherExtras.weatherCode,
    earthquakeCount,
    maxEarthquakeMagnitude,
    nearestEarthquakeDistanceKm,
    floodRiskIndex,
    fetchedAt: new Date(),
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
  computeFloodRiskIndex,
};