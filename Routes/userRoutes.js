const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');
const metricsMiddleware = require('../Middlewares/metricsMiddlewares');
const rateLimiter = require('../Middlewares/rateLimiter');

router.post('/users/register', rateLimiter.authLimiter, metricsMiddleware.incrementUserCounter, authController.registerUser);
router.post('/users/login', rateLimiter.authLimiter, authController.loginUser);

router.get('/users', authController.getAllUsers);


module.exports = router;