const axios = require("axios");

const OPENWEATHER_BASE_URL =
  process.env.OPENWEATHER_BASE_URL || "https://api.openweathermap.org/data/2.5";
const USGS_BASE_URL =
  process.env.USGS_BASE_URL || "https://earthquake.usgs.gov/fdsnws/event/1/query";

const getWeatherData = async ({ lat, lng }) => {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) throw new Error("OPENWEATHER_API_KEY not set in .env");

  // Using "weather" endpoint (simple + stable)
  const url = `${OPENWEATHER_BASE_URL}/weather`;
  const { data } = await axios.get(url, {
    params: { lat, lon: lng, appid: apiKey, units: "metric" },
  });

  const temperature = data?.main?.temp ?? 0;
  const windSpeed = data?.wind?.speed ?? 0;

  // rain.1h may not exist always
  const rainfall = data?.rain?.["1h"] ?? 0;

  return { temperature, windSpeed, rainfall };
};

const getEarthquakeCount = async ({ lat, lng, days = 7, radiusKm = 100 }) => {
  const end = new Date();
  const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const formatDate = (d) => d.toISOString().split("T")[0];

  const { data } = await axios.get(USGS_BASE_URL, {
    params: {
      format: "geojson",
      starttime: formatDate(start),
      endtime: formatDate(end),
      latitude: lat,
      longitude: lng,
      maxradiuskm: radiusKm,
    },
  });

  return data?.metadata?.count ?? 0;
};

// Simple derived risk index: 0-100
// You can improve later, but keep it inside Component 2.
const calculateFloodRiskIndex = ({ rainfall, windSpeed }) => {
  // Basic heuristic:
  // rainfall heavy -> higher, wind a little influence
  let score = 0;

  if (rainfall >= 50) score += 70;
  else if (rainfall >= 20) score += 45;
  else if (rainfall >= 5) score += 20;
  else score += 5;

  if (windSpeed >= 15) score += 15;
  else if (windSpeed >= 8) score += 8;

  if (score > 100) score = 100;
  return score;
};

module.exports = {
  getWeatherData,
  getEarthquakeCount,
  calculateFloodRiskIndex,
};