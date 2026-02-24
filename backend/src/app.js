const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");

/* ✅ NEWLY ADDED: risk-data routes */
const riskDataRoutes = require("./routes/riskData.routes");
/* ✅ END */

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API is running successfully 🚀" });
});

app.use("/api/auth", authRoutes);

/* ✅ NEWLY ADDED: mount risk-data endpoints */
app.use("/api/risk-data", riskDataRoutes);
/* ✅ END */

// ✅ NEWLY ADDED: 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ✅ NEWLY ADDED: global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    message: err.message || "Server error",
  });
});

module.exports = app;