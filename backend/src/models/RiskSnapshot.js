const mongoose = require("mongoose");

const RiskSnapshotSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    // store only what Component 3 needs
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },

    rainfallMm: { type: Number, default: 0 },     // 0..?
    windSpeedMs: { type: Number, default: 0 },    // m/s
    floodLikelihood: { type: Number, default: 0 },// 0..100

    // optional field if you add later
    earthquakeIndex: { type: Number, default: 0 },// 0..100
  },
  { timestamps: true }
);

RiskSnapshotSchema.index({ projectId: 1, createdAt: -1 });

module.exports = mongoose.model("RiskSnapshot", RiskSnapshotSchema);