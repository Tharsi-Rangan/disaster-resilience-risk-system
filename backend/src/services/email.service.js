const nodemailer = require("nodemailer");

const createTransporter = () => {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;

  if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) {
    throw new Error("Email env vars missing: EMAIL_HOST/PORT/USER/PASS");
  }

  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT),
    secure: false, // true only for 465
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
};

const sendOtpEmail = async ({ to, subject, otp, purpose }) => {
  const transporter = createTransporter();

  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6">
      <h2>${purpose}</h2>
      <p>Your 6-digit OTP code is:</p>
      <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px; margin: 16px 0;">
        ${otp}
      </div>
      <p>This code will expire soon. If you didn't request this, you can ignore this email.</p>
      <hr />
      <p style="font-size: 12px; color: #666;">
        Disaster Resilience Risk System
      </p>
    </div>
  `;

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    html,
  });

  return info.messageId;
};

module.exports = { sendOtpEmail };