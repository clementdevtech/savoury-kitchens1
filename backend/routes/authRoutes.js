const express = require('express');
const router = express.Router();
const { register, check_user, login, forgotPassword } = require('../controllers/authController');

router.post('/register', register);
router.post('/check-user', check_user);
router.post('/login', login);
router.post("/forgot-password", forgotPassword);

module.exports = router;
