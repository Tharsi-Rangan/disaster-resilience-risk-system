const axios = require("axios");

const OPENWEATHER_BASE = "https://api.openweathermap.org/data/2.5/weather";

async function fetchOpenWeather({ lat, lng }) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) throw new Error("OPENWEATHER_API_KEY is missing in .env");

  const { data } = await axios.get(OPENWEATHER_BASE, {
    params: {
      lat,
      lon: lng,
      appid: apiKey,
      units: "metric",
    },
    timeout: 10000,
  });

  const rainfall =
    (data.rain && (data.rain["1h"] || data.rain["3h"])) ? (data.rain["1h"] || data.rain["3h"]) : 0;

  return {
    temperature: data.main?.temp ?? 0,
    windSpeed: data.wind?.speed ?? 0,
    humidity: data.main?.humidity ?? 0,
    cloudiness: data.clouds?.all ?? 0,
    rainfall: rainfall ?? 0,
  };
}

module.exports = { fetchOpenWeather };