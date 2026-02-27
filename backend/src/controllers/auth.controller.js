const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const generateOtp = require("../utils/otpGenerator");
const { sendOtpEmail } = require("../services/email.service");

const register = async (req, res) => {
  try {
    // 1) validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // 2) check existing user
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // 3) hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4) create OTP + expiry
    const otp = generateOtp();
    const expireMinutes = Number(process.env.OTP_EXPIRE_MIN || 10);
    const otpExpires = new Date(Date.now() + expireMinutes * 60 * 1000);

    // 5) create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      verificationOtp: otp,
      verificationOtpExpires: otpExpires,
    });

    // 6) send OTP email
    await sendOtpEmail({
      to: email,
      subject: "Verify your email (OTP)",
      otp,
      purpose: "Email Verification",
    });

    // 7) respond
    return res.status(201).json({
      message: "Registration successful. OTP sent to email for verification.",
      userId: user._id,
      email: user.email,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    if (!user.verificationOtp || !user.verificationOtpExpires) {
      return res
        .status(400)
        .json({ message: "No OTP found. Please register again." });
    }

    if (user.verificationOtpExpires < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    if (user.verificationOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.isVerified = true;
    user.verificationOtp = undefined;
    user.verificationOtpExpires = undefined;

    await user.save();

    return res.json({ message: "Email verified successfully " });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email first" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Login successful.",
      token,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Optional: block reset if email not verified
    if (!user.isVerified) {
      return res.status(400).json({ message: "Email not verified" });
    }

    const otp = generateOtp();
    const expireMin = parseInt(process.env.OTP_EXPIRE_MIN || "10", 10);
    const expiresAt = new Date(Date.now() + expireMin * 60 * 1000);

    user.resetOtp = otp;
    user.resetOtpExpires = expiresAt;
    await user.save();

    await sendOtpEmail({
      to: user.email,
      subject: "Password Reset OTP",
      otp,
      purpose: "Reset your password",
    });

    return res.json({ message: "Reset OTP sent to email." });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.resetOtp || !user.resetOtpExpires) {
      return res.status(400).json({ message: "No reset OTP requested" });
    }

    if (user.resetOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.resetOtpExpires < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // clear otp after success
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;

    await user.save();

    return res.json({ message: "Password reset successful." });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { register, verifyEmail, login, forgotPassword, resetPassword };