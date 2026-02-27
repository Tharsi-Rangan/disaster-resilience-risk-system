const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const projectRoutes = require("./routes/project.routes");

/* ✅ NEWLY ADDED: risk-data routes (Component 2) */
const riskDataRoutes = require("./routes/riskData.routes");
/* ✅ END */
const assessmentRoutes = require("./routes/assessment.routes");
const mitigationRoutes = require("./routes/mitigation.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API is running successfully 🚀" });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/mitigation", mitigationRoutes);

/*  NEWLY ADDED: mount risk-data endpoints */
app.use("/api/risk-data", riskDataRoutes);
/*  END */

/*  NEWLY ADDED: 404 handler */
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});
/*  END */

/*  NEWLY ADDED: global error handler */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    message: err.message || "Server error",
  });
});
/* ✅ END */

app.use("/api/assessments", assessmentRoutes);

module.exports = app;