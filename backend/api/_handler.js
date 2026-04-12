require("dotenv").config({ quiet: true });

const app = require("../src/app");
const connectDB = require("../src/config/db");

let dbReadyPromise = null;

// Dynamic CORS origin detection
function getCorsOrigin(requestOrigin) {
  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
  ];

  // Add origins from environment variable
  if (process.env.CORS_ALLOWED_ORIGINS) {
    allowedOrigins.push(
      ...process.env.CORS_ALLOWED_ORIGINS.split(",").map((o) => o.trim())
    );
  }

  // Allow any *.vercel.app domain in production
  if (process.env.NODE_ENV === "production" && requestOrigin) {
    if (/^https:\/\/.*\.vercel\.app$/.test(requestOrigin)) {
      return requestOrigin;
    }
  }

  return allowedOrigins.includes(requestOrigin) ? requestOrigin : null;
}

function applyCorsHeaders(req, res) {
  const origin = getCorsOrigin(req.headers.origin);
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
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