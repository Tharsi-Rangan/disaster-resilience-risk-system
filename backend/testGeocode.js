require("dotenv").config();
const geocodeService = require("./src/services/geocode.service");

(async () => {
  try {
    const coords = await geocodeService.getCoordinates("Colombo, Sri Lanka");
    console.log("Coordinates:", coords);
  } catch (err) {
    console.error(err.message);
  }
})();