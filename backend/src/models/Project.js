const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  projectType: { type: String, enum: ["bridge", "road", "building"], required: true },
  location: {
    address: { type: String, required: true },
    lat: { type: Number },
    lng: { type: Number },
  },
  budget: { type: Number },
  startDate: { type: Date },
  endDate: { type: Date },
  status: { type: String, enum: ["DRAFT", "ANALYZING", "APPROVED", "HIGH_RISK"], default: "DRAFT" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

module.exports = mongoose.model("Project", projectSchema);