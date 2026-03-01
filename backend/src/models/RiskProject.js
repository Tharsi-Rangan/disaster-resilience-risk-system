const mongoose = require("mongoose");

const riskProjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },

    location: {
      address: { type: String, default: "" },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },

    // optional, can be used later when project module is integrated
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RiskProject", riskProjectSchema);