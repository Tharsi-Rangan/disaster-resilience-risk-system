const mongoose = require("mongoose");

const RiskSnapshotSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    // Weather
    rainfall: { type: Number, default: 0 }, // mm
    windSpeed: { type: Number, default: 0 }, // m/s
    temperature: { type: Number, default: 0 }, // °C
    humidity: { type: Number, default: 0 }, // %
    cloudiness: { type: Number, default: 0 }, // %
    pressure: { type: Number, default: 0 }, // hPa
    visibility: { type: Number, default: 0 }, // meters
    weatherCode: { type: Number, default: null },

    // Earthquake
    earthquakeCount: { type: Number, default: 0 },
    maxEarthquakeMagnitude: { type: Number, default: null },
    nearestEarthquakeDistanceKm: { type: Number, default: null },

    // Simple index (NOT assessment score)
    floodRiskIndex: { type: Number, default: 0 }, // 0 - 100

    fetchedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    source: {
      type: String,
      default: "OpenWeather/USGS",
    },
  },
  { timestamps: true }
);

// For latest snapshot queries + history
RiskSnapshotSchema.index({ projectId: 1, createdAt: -1 });

module.exports = mongoose.model("RiskSnapshot", RiskSnapshotSchema);