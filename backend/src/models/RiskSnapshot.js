const mongoose = require("mongoose");

const riskSnapshotSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    rainfall: { type: Number, default: 0 }, // mm (last 1h if available)
    windSpeed: { type: Number, default: 0 }, // m/s
    temperature: { type: Number, default: 0 }, // °C

    earthquakeCount: { type: Number, default: 0 }, // count in last 7 days (radius based)
    floodRiskIndex: { type: Number, default: 0 }, // 0-100 (derived)

    fetchedAt: { type: Date, default: Date.now, index: true },
    source: {
      openWeather: { type: Boolean, default: true },
      usgs: { type: Boolean, default: false },
    },
    meta: {
      lat: Number,
      lng: Number,
      note: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RiskSnapshot", riskSnapshotSchema);