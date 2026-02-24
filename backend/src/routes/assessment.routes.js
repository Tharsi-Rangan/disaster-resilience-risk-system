const router = require("express").Router();
const ctrl = require("../controllers/assessment.controller");

// TEMP: Auth disabled for local testing until auth module is finalized.
// TODO: Re-enable auth + role middleware before final submission.

router.post("/run/:projectId", ctrl.runAssessment);
router.get("/:projectId/latest", ctrl.getLatest);
router.get("/:projectId/history", ctrl.getHistory);
router.delete("/:id", ctrl.deleteOne);
router.get("/:id", ctrl.getOne);
router.put("/:id", ctrl.updateOne);
module.exports = router;