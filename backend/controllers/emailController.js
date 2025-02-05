const nodemailer = require("nodemailer");
const { Pool } = require("../db");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

// ✅ Send Email Verification Code
const sendVerificationEmail = async (email) => {
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  await pool.query(
    "INSERT INTO email_verifications (email, code, expires_at) VALUES ($1, $2, NOW() + INTERVAL '10 minutes')",
    [email, verificationCode]
  );

  await sendEmail(email, "Email Verification Code", `Your verification code is ${verificationCode}. It expires in 10 minutes.`);
};

// ✅ Verify Email
const verifyEmail = async (req, res) => {
  const { email, code } = req.body;
  try {
    const result = await pool.query(
      "SELECT * FROM email_verifications WHERE email = $1 AND code = $2 AND expires_at > NOW()",
      [email, code]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired code." });
    }

    await pool.query("DELETE FROM email_verifications WHERE email = $1", [email]);
    await pool.query("UPDATE users SET verified = true WHERE email = $1", [email]);

    res.json({ message: "Email verified successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Error verifying email" });
  }
};

// ✅ Send Password Recovery Code (Expires in 10 Minutes, Can Resend Every 60 Minutes)
const sendPasswordRecoveryEmail = async (email) => {
  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (user.rows.length === 0) {
      return { error: "User not found" };
    }

    const existingRequest = await pool.query(
      "SELECT * FROM password_resets WHERE email = $1 AND expires_at > NOW() - INTERVAL '60 minutes'",
      [email]
    );

    if (existingRequest.rows.length > 0) {
      return { error: "You can only request a recovery code once every 60 minutes." };
    }

    const recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();
    await pool.query(
      "INSERT INTO password_resets (email, code, expires_at) VALUES ($1, $2, NOW() + INTERVAL '10 minutes') ON CONFLICT (email) DO UPDATE SET code = $2, expires_at = NOW() + INTERVAL '10 minutes'",
      [email, recoveryCode]
    );

    await sendEmail(email, "Password Recovery Code", `Your recovery code is ${recoveryCode}. It expires in 10 minutes.`);
    return { message: "Recovery code sent to email." };
  } catch (error) {
    console.error("Error sending password recovery email:", error);
    return { error: "Error sending recovery email." };
  }
};

// ✅ Verify Password Recovery Code
const verifyRecoveryCode = async (req, res) => {
  const { email, code } = req.body;
  try {
    const result = await pool.query(
      "SELECT * FROM password_resets WHERE email = $1 AND code = $2 AND expires_at > NOW()",
      [email, code]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired recovery code." });
    }

    res.json({ message: "Recovery code verified! You may now reset your password." });
  } catch (err) {
    res.status(500).json({ message: "Error verifying recovery code" });
  }
};

module.exports = { sendEmail, sendVerificationEmail, verifyEmail, sendPasswordRecoveryEmail, verifyRecoveryCode };
