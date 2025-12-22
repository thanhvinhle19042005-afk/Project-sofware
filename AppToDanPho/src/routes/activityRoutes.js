// src/routes/activityRoutes.js
const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');

// GET /api/activities
router.get('/', activityController.getAllActivities);

// POST /api/activities/register
router.post('/register', activityController.registerActivity);

module.exports = router;