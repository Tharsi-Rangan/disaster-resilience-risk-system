const axios = require("axios");

async function getElevationOpenMeteo(lat, lng) {
  const url = "https://api.open-meteo.com/v1/elevation";
  const { data } = await axios.get(url, { params: { latitude: lat, longitude: lng } });
  // open-meteo returns: elevation: [..]
  const elevation = Array.isArray(data?.elevation) ? data.elevation[0] : data?.elevation;
  return typeof elevation === "number" ? elevation : null;
}

async function getElevationGoogle(lat, lng) {
  const key = process.env.GOOGLE_ELEVATION_API_KEY;
  if (!key) return null;

  const url = "https://maps.googleapis.com/maps/api/elevation/json";
  const { data } = await axios.get(url, {
    params: { locations: `${lat},${lng}`, key },
  });

  const elevation = data?.results?.[0]?.elevation;
  return typeof elevation === "number" ? elevation : null;
}

exports.getElevation = async (lat, lng) => {
  const provider = (process.env.ELEVATION_API_PROVIDER || "open-meteo").toLowerCase();
  try {
    if (provider === "google") return await getElevationGoogle(lat, lng);
    return await getElevationOpenMeteo(lat, lng);
  } catch (e) {
    return null; // fail-safe
  }
};