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
    rainfall: { type: Number, default: 0 }, // mm (last 1h if available)
    windSpeed: { type: Number, default: 0 }, // m/s
    temperature: { type: Number, default: 0 }, // °C
    humidity: { type: Number, default: 0 }, // %
    cloudiness: { type: Number, default: 0 }, // %
    pressure: { type: Number, default: null }, // hPa
    visibility: { type: Number, default: null }, // meters
    weatherCode: { type: Number, default: null }, // WMO weather code

    // Earthquake
    earthquakeCount: { type: Number, default: 0 },
    maxEarthquakeMagnitude: { type: Number, default: null }, // Highest magnitude in timeframe
    nearestEarthquakeDistanceKm: { type: Number, default: null }, // Distance to nearest quake
    earthquakeWindowDays: { type: Number, default: 30 }, // Days to lookback for earthquakes
    earthquakeRadiusKm: { type: Number, default: 200 }, // Search radius in kilometers
    minEarthquakeMagnitude: { type: Number, default: 3 }, // Minimum magnitude threshold

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
