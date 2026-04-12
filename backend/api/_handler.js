require("dotenv").config({ quiet: true });

const app = require("../src/app");
const connectDB = require("../src/config/db");

let dbReadyPromise = null;

async function ensureDatabaseConnection() {
  if (!dbReadyPromise) {
    dbReadyPromise = connectDB().catch((error) => {
      dbReadyPromise = null;
      throw error;
    });
  }

  return dbReadyPromise;
}

module.exports = async (req, res) => {
  await ensureDatabaseConnection();
  return app(req, res);
};