const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

console.log("User Controller:", userController); 
if (!userController.getAllUsers) {
    console.error('Error: getAllUsers function is missing in userController.');
}

router.get('/', userController.getAllUsers); 

module.exports = router;
