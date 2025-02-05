const express = require("express");
const { verifyEmail } = require("../controllers/emailController");

const router = express.Router();

router.post("/verify-email", verifyEmail);

module.exports = router;
