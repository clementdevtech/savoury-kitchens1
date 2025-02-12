const express = require("express");
const { verifyEmail, sendVerificationEmail } = require("../controllers/emailController");

const router = express.Router();

router.post("/verify-email", verifyEmail);
router.post('/sendcode', sendVerificationEmail);

module.exports = router;
