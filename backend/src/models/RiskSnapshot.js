const mongoose = require("mongoose");

const RiskSnapshotSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    // --- Component 2 stored fields (MATCH DB) ---
    rainfall: { type: Number, default: 0 },        // mm (or mm/h depending on your fetch logic)
    windSpeed: { type: Number, default: 0 },       // m/s
    temperature: { type: Number, default: 0 },     // °C
    humidity: { type: Number, default: 0 },        // %
    cloudiness: { type: Number, default: 0 },      // %

    earthquakeCount: { type: Number, default: 0 }, // count (normalize in assessment)
    floodRiskIndex: { type: Number, default: 0 },  // 0..100 (already computed in C2)

    fetchedAt: { type: Date, default: Date.now },
    source: { type: String, default: "OpenMeteo/USGS" },
  },
  { timestamps: true }
);

// For latest snapshot queries + history
RiskSnapshotSchema.index({ projectId: 1, createdAt: -1 });

module.exports = mongoose.model("RiskSnapshot", RiskSnapshotSchema);