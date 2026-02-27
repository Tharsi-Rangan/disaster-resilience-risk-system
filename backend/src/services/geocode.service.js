const axios = require("axios");

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
console.log("API KEY:", GOOGLE_MAPS_API_KEY);

exports.getCoordinates = async (address) => {
  const encodedAddress = encodeURIComponent(address);
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${GOOGLE_MAPS_API_KEY}`;

  console.log("Using API key:", GOOGLE_MAPS_API_KEY);
  console.log("Address to geocode:", address);

  const response = await axios.get(url);
  const data = response.data;

  if (data.status !== "OK" || data.results.length === 0) {
    console.log("Google response:", data);
    throw new Error("Unable to geocode address");
  }

  const location = data.results[0].geometry.location;
  return { lat: location.lat, lng: location.lng };
};

