const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    status: { type: String, default: "DRAFT" },
    location: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
      address: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", ProjectSchema);