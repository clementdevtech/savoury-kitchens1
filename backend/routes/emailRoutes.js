const express = require("express");
const { verifyEmail, sendPasswordRecoveryEmail } = require("../controllers/emailController");

const router = express.Router();

router.post("/verify-email", verifyEmail);
router.post("/sendcode", sendPasswordRecoveryEmail);

module.exports = router;
