const mongoose = require("mongoose");

const RiskAssessmentSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    snapshotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RiskData",
      default: null,
    },
    riskScore: { type: Number, required: true, min: 0, max: 100 },
    riskLevel: { type: String, required: true, enum: ["LOW", "MEDIUM", "HIGH"] },

    weatherScore: { type: Number, default: 0, min: 0, max: 100 },
    earthquakeScore: { type: Number, default: 0, min: 0, max: 100 },
    floodScore: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RiskAssessment", RiskAssessmentSchema);