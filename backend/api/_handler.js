require("dotenv").config({ quiet: true });

const app = require("../src/app");
const connectDB = require("../src/config/db");

let dbReadyPromise = null;

const allowedOrigins = (
  process.env.CORS_ALLOWED_ORIGINS ||
  "http://localhost:5173,https://disaster-resilience-risk-system-fro.vercel.app"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const vercelFrontendOriginPatterns = [
  /^https:\/\/disaster-resilience-risk-system(?:-[a-z0-9]+)?\.vercel\.app$/i,
  /^https:\/\/disaster-resilience-risk-system1(?:-[a-z0-9]+)?\.vercel\.app$/i,
  /^https:\/\/disaster-resilience-risk-system-frontend(?:-[a-z0-9]+)?\.vercel\.app$/i,
];

function isOriginAllowed(origin) {
  return allowedOrigins.includes(origin)
    || vercelFrontendOriginPatterns.some((pattern) => pattern.test(origin));
}

function applyCorsHeaders(req, res) {
  const requestOrigin = req.headers.origin;

  if (requestOrigin && isOriginAllowed(requestOrigin)) {
    res.setHeader("Access-Control-Allow-Origin", requestOrigin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
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
    return res.status(204).end();
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