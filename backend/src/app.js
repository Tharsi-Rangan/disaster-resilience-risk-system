const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const projectRoutes = require("./routes/project.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API is running successfully 🚀" });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);

module.exports = app;
