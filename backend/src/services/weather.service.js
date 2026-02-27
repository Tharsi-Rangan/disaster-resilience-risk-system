const axios = require("axios");

/* ✅ NEWLY ADDED: allow overriding base URLs via .env (optional) */
const OPENWEATHER_BASE =
  process.env.OPENWEATHER_BASE_URL || "https://api.openweathermap.org/data/2.5/weather";

const OPEN_METEO_BASE =
  process.env.OPEN_METEO_BASE_URL || "https://api.open-meteo.com/v1/forecast";
/* ✅ END */

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function validateCoords(lat, lng) {
  const la = Number(lat);
  const lo = Number(lng);
  if (!Number.isFinite(la) || !Number.isFinite(lo)) return false;
  if (la < -90 || la > 90) return false;
  if (lo < -180 || lo > 180) return false;
  return true;
}

async function fetchFromOpenWeather({ lat, lng }) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) throw new Error("OPENWEATHER_API_KEY is missing in .env");

  const { data } = await axios.get(OPENWEATHER_BASE, {
    params: { lat, lon: lng, appid: apiKey, units: "metric" },
    timeout: 20000, // ✅ NEWLY ADDED: increased timeout
  });

  const rainfallRaw =
    data?.rain && (data.rain["1h"] || data.rain["3h"]) ? data.rain["1h"] || data.rain["3h"] : 0;

  return {
    temperature: toNumber(data?.main?.temp, 0),
    windSpeed: toNumber(data?.wind?.speed, 0),
    humidity: toNumber(data?.main?.humidity, 0),
    cloudiness: toNumber(data?.clouds?.all, 0),
    rainfall: toNumber(rainfallRaw, 0),
    source: "OpenWeather",
  };
}

async function fetchFromOpenMeteo({ lat, lng }) {
  const { data } = await axios.get(OPEN_METEO_BASE, {
    params: {
      latitude: lat,
      longitude: lng,
      current:
        "temperature_2m,precipitation,wind_speed_10m,relative_humidity_2m,cloud_cover",
    },
    timeout: 20000, // ✅ NEWLY ADDED: increased timeout
  });

  const c = data?.current || {};

  return {
    temperature: toNumber(c.temperature_2m, 0),
    windSpeed: toNumber(c.wind_speed_10m, 0),
    humidity: toNumber(c.relative_humidity_2m, 0),
    cloudiness: toNumber(c.cloud_cover, 0),
    rainfall: toNumber(c.precipitation, 0),
    source: "OpenMeteo",
  };
}

/**
 * Main function used by riskData.service.js
 * Tries OpenWeather first, falls back to Open-Meteo on error.
 */
async function fetchOpenWeather({ lat, lng }) {
  /* ✅ NEWLY ADDED: coordinate validation */
  if (!validateCoords(lat, lng)) {
    const err = new Error("Invalid coordinates for weather fetch");
    err.statusCode = 400;
    throw err;
  }
  /* ✅ END */

  try {
    return await fetchFromOpenWeather({ lat, lng });
  } catch (e1) {
    try {
      return await fetchFromOpenMeteo({ lat, lng });
    } catch (e2) {
      /* ✅ NEWLY ADDED: if both APIs fail, throw a clear error */
      const err = new Error("Weather providers failed (OpenWeather + OpenMeteo)");
      err.statusCode = 502;
      throw err;
      /* ✅ END */
    }
  }
}

module.exports = { fetchOpenWeather };