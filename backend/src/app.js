const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const projectRoutes = require("./routes/project.routes");
const riskDataRoutes = require("./routes/riskData.routes");
const assessmentRoutes = require("./routes/assessment.routes");
const mitigationRoutes = require("./routes/mitigation.routes");

const app = express();

app.use(cors());
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