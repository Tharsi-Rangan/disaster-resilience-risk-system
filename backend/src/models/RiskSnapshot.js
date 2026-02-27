const mongoose = require("mongoose");

const RiskSnapshotSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    // Component 2 fields (match DB)
    rainfall: { type: Number, default: 0 },       // mm
    windSpeed: { type: Number, default: 0 },      // m/s
    temperature: { type: Number, default: 0 },    // °C
    humidity: { type: Number, default: 0 },       // %
    cloudiness: { type: Number, default: 0 },     // %
    earthquakeCount: { type: Number, default: 0 },// count
    floodRiskIndex: { type: Number, default: 0 }, // 0..100 (already computed by C2)

    fetchedAt: { type: Date, default: Date.now },
    source: { type: String, default: "OpenMeteo/USGS" },
  },
  { timestamps: true }
);

RiskSnapshotSchema.index({ projectId: 1, createdAt: -1 });

module.exports = mongoose.model("RiskSnapshot", RiskSnapshotSchema);