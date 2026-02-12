const router = require("express").Router();

router.get("/ping", (req, res) => {
  res.json({ message: "Auth route working correctly ✅" });
});

module.exports = router;
