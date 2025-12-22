// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Định nghĩa đường dẫn: POST /api/auth/login
router.post('/login', authController.login);

module.exports = router;