const router = require("express").Router();
const ctrl = require("../controllers/assessment.controller");

router.post("/run/:projectId", ctrl.runAssessment);
router.get("/:projectId/latest", ctrl.getLatest);
router.get("/:projectId/history", ctrl.getHistory);

router.get("/by-id/:id", ctrl.getOne);
router.put("/:id", ctrl.updateOne);
router.delete("/:id", ctrl.deleteOne);

module.exports = router;