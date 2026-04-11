const mongoose = require("mongoose");

/*
  Nested schema for recommendations
  Each mitigation plan can have multiple recommendations
*/
const recommendationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["FLOOD", "WEATHER", "EARTHQUAKE", "GENERAL"],
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "ONGOING", "COMPLETED"],
      default: "PENDING",
    },
    actionNote: {
      type: String,
      default: "",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    updatedAt: {
      type: Date,
      default: null,
    },
  }
  // Removed { _id: false } so Mongoose auto-generates _ids for recommendations to help with individual updates
);

/*
  Main Mitigation Plan schema
*/
const mitigationPlanSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RiskAssessment",
      required: true,
    },

    snapshotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RiskSnapshot",
      default: null,
    },

    priorityLevel: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      required: true,
    },

    planStatus: {
      type: String,
      enum: ["PENDING", "IN_PROGRESS", "COMPLETED"],
      default: "PENDING",
    },

    totalRecommendations: { type: Number, default: 0 },
    pendingCount: { type: Number, default: 0 },
    ongoingCount: { type: Number, default: 0 },
    completedCount: { type: Number, default: 0 },

    recommendations: {
      type: [recommendationSchema],
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    aiProvider: {
      type: String,
      enum: ["NONE", "GEMINI", "OPENAI"],
      default: "NONE",
    },

    promptVersion: {
      type: String,
      default: "v1",
    },
  },
  { timestamps: true }
);

/* Compound index for faster retrieval of latest mitigation per project */
mitigationPlanSchema.index({ projectId: 1, createdAt: -1 });

module.exports = mongoose.model("MitigationPlan", mitigationPlanSchema);