// app.js
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const projectRoutes = require("./routes/project.routes");
const riskDataRoutes = require("./routes/riskData.routes");
const assessmentRoutes = require("./routes/assessment.routes");
const mitigationRoutes = require("./routes/mitigation.routes");

const app = express();

// Dynamic CORS configuration from environment variables
const corsOptions = {
  origin: function (origin, callback) {
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
    if (process.env.NODE_ENV === "production" && origin) {
      if (/^https:\/\/.*\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }
    }

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());


app.get("/", (req, res) => {
  res.json({ message: "API is running successfully 🚀" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
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