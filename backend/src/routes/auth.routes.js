const router = require("express").Router();
const { body } = require("express-validator");
const authController = require("../controllers/auth.controller");

const { sendOtpEmail } = require("../services/email.service");
const generateOtp = require("../utils/otpGenerator");
const protect = require("../middleware/auth.middleware");

/*
----------------------------------------------------
TEST EMAIL ROUTE (Temporary - for testing only)
----------------------------------------------------
*/
router.post("/test-email", async (req, res) => {
  try {
    const { email } = req.body;
    const otp = generateOtp();

    await sendOtpEmail({
      to: email,
      subject: "Test OTP Email",
      otp,
      purpose: "Email Service Test",
    });

    // REMOVE otp from response before final submission
    res.json({ message: "Test email sent" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/*
----------------------------------------------------
REGISTER ROUTE
----------------------------------------------------
*/
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
  ],
  authController.register
);

router.post(
  "/verify-email",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("otp")
      .isLength({ min: 6, max: 6 })
      .withMessage("OTP must be 6 digits"),
  ],
  authController.verifyEmail
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  authController.login
);

router.get("/me", protect, async (req, res) => {
  res.json({
    message: "You are authenticated ✅",
    userId: req.user.id,
  });
});

/*
----------------------------------------------------
PING ROUTE
----------------------------------------------------
*/
router.get("/ping", (req, res) => {
  res.json({ message: "Auth route working correctly ✅" });
});

module.exports = router;