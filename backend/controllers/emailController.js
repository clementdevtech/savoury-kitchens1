const nodemailer = require("nodemailer");
const { pool } = require("../db");
const crypto = require("crypto");
require("dotenv").config();

// Load environment variables
const CLIENT_URL = process.env.CLIENT_URL;
const COMPANY_NAME = process.env.COMPANY_NAME;
const COMPANY_LOGO = process.env.COMPANY_LOGO;
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL;

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// **Reusable function to send emails**
const sendEmail = async (to, subject, htmlContent) => {
  try {
    await transporter.sendMail({
      from: `${COMPANY_NAME} <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    });
    console.log(`✅ Email sent successfully to ${to}`);
  } catch (error) {
    console.error(`❌ Error sending email: ${error.message}`);
  }
};

// **Send Email Verification (Link + Code)**
const sendVerificationEmail = async (req, res) => {
  const { email } = req.body;

  if (!email || !email.match(/^\S+@\S+\.\S+$/)) {
    return res.status(400).json({ message: "Invalid email format." });
  }

  try {
    // Check if user exists
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (user.rows.length === 0) {
      return res.json({ message: "User not found. Redirecting to registration.", redirect: "/register" });
    }

    // Generate a short verification token & code
    const verificationToken = crypto.randomUUID();
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code

    // Hash the token & code for security
    const hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex");

    // Store both token and code in the database
    await pool.query(
      `INSERT INTO email_verifications (email, token, code, expires_at) 
       VALUES ($1, $2, $3, NOW() + INTERVAL '10 minutes') 
       ON CONFLICT (email) 
       DO UPDATE SET token = $2, code = $3, expires_at = NOW() + INTERVAL '10 minutes'`,
      [email, hashedToken, verificationCode]
    );

    // Create a clickable verification link
    const verificationLink = `${CLIENT_URL}/email-verification?token=${verificationToken}&email=${email}`;

    // HTML email template with both the link & the 6-digit code
    const emailTemplate = `
      <div style="background: #f8f9fa; padding: 20px; text-align: center;">
        <img src="${COMPANY_LOGO}" alt="${COMPANY_NAME}" style="max-width: 150px; margin-bottom: 20px;">
        <h2 style="color: #333;">Verify Your Email</h2>
        <p style="font-size: 16px; color: #555;">
          Click the button below to verify your email address and activate your account.
        </p>
        <a href="${verificationLink}" style="display: inline-block; padding: 12px 20px; font-size: 16px; 
          color: #fff; background-color: #007bff; border-radius: 5px; text-decoration: none; font-weight: bold;">
          Verify Email
        </a>
        <p style="font-size: 16px; color: #555;">Or enter this 6-digit code: <strong>${verificationCode}</strong></p>
        <p style="font-size: 14px; color: #777; margin-top: 20px;">
          This link and code will expire in 10 minutes. If you did not request this email, please ignore it.
        </p>
        <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 14px; color: #999;">
          Need help? Contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color: #007bff;">${SUPPORT_EMAIL}</a>
        </p>
      </div>
    `;

    await sendEmail(email, "Email Verification", emailTemplate);

    res.json({ message: "Verification link & code sent to email." });
  } catch (error) {
    console.error(`Error sending verification email: ${error.message}`);
    res.status(500).json({ message: "Error sending verification email." });
  }
};

// **Verify Email (Token or Code)**
const verifyEmail = async (req, res) => {
  const { token, email, code } = req.body;

  if (!email || (!token && !code)) {
    return res.status(400).json({ message: "Missing verification details." });
  }

  try {
    let query = "";
    let param = "";

    if (token) {
      const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
      query = "SELECT * FROM email_verifications WHERE token = $1 AND email = $2 AND expires_at > NOW()";
      param = hashedToken;
    } else if (code) {
      query = "SELECT * FROM email_verifications WHERE code = $1 AND email = $2 AND expires_at > NOW()";
      param = code;
    }

    const result = await pool.query(query, [param, email]);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired token/code." });
    }

    // Mark user as verified
    await pool.query("UPDATE users SET verified = true WHERE email = $1", [email]);

    // Prevent reuse
    await pool.query("DELETE FROM email_verifications WHERE email = $1", [email]);

    res.json({ message: "Email verified successfully! Redirecting to login.", redirect: "/login" });
  } catch (err) {
    console.error(`Error verifying email: ${err.message}`);
    res.status(500).json({ message: "Error verifying email." });
  }
};

// **Send Password Recovery Email**
const sendPasswordRecoveryEmail = async (req, res) => {
  const { email } = req.body;

  if (!email || !email.match(/^\S+@\S+\.\S+$/)) {
    return res.status(400).json({ message: "Invalid email format." });
  }

  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    await pool.query(
      `INSERT INTO password_resets (email, token, expires_at) 
       VALUES ($1, $2, NOW() + INTERVAL '10 minutes') 
       ON CONFLICT (email) 
       DO UPDATE SET token = $2, expires_at = NOW() + INTERVAL '10 minutes'`,
      [email, hashedToken]
    );

    const resetLink = `${CLIENT_URL}/reset-password?token=${resetToken}`;

    const emailContent = `
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>This link will expire in 10 minutes.</p>
    `;

    await sendEmail(email, "Password Reset Request", emailContent);

    res.json({ message: "Password reset link sent to email." });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    res.status(500).json({ message: "Error sending password reset email." });
  }
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  verifyEmail,
  sendPasswordRecoveryEmail,
};
