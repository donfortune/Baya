const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');
const metricsMiddleware = require('../Middlewares/metricsMiddlewares');

router.get('/users', authController.getAllUsers);
router.post('/users/register', metricsMiddleware.incrementUserCounter, authController.registerUser);
router.post('/users/login', authController.loginUser);

module.exports = router;