// app.js
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const projectRoutes = require("./routes/project.routes");
const riskDataRoutes = require("./routes/riskData.routes");
const assessmentRoutes = require("./routes/assessment.routes");
const mitigationRoutes = require("./routes/mitigation.routes");

const app = express();

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

const corsOptions = {
  origin(origin, callback) {
    if (!origin || isOriginAllowed(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("CORS not allowed"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API is running successfully 🚀" });
});

/* ROUTES */
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/risk-data", riskDataRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/mitigation", mitigationRoutes);

/* 404 handler */
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

/* Global error handler */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    message: err.message || "Server error",
  });
});

module.exports = app;