require("dotenv").config({ quiet: true });

const app = require("../src/app");
const connectDB = require("../src/config/db");

let dbReadyPromise = null;

function applyCorsHeaders(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://disaster-resilience-risk-system-frontend-fkkc0dw8v.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

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
  applyCorsHeaders(req, res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    await ensureDatabaseConnection();
    return app(req, res);
  } catch (error) {
    console.error("Server startup failed:", error);

    if (!res.headersSent) {
      return res.status(500).json({
        message: "Server startup error",
      });
    }
  }
};