const router = require("express").Router();

const { sendOtpEmail } = require("../services/email.service");
const generateOtp = require("../utils/otpGenerator");

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

    res.json({ message: "Test email sent", otp }); // otp only for testing now
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/ping", (req, res) => {
  res.json({ message: "Auth route working correctly ✅" });
});

module.exports = router;
