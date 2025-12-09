const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');

router.get('/users', authController.getAllUsers);
router.post('/users/register', authController.registerUser);
router.post('/users/login', authController.loginUser);

module.exports = router;