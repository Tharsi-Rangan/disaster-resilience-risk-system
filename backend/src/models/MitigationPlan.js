const mongoose = require("mongoose");

const mitigationPlanSchema = new mongoose.Schema(
  {
    // will fill later
  },
  { timestamps: true }
);

module.exports = mongoose.model("MitigationPlan", mitigationPlanSchema);