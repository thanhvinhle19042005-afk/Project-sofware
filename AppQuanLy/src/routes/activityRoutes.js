const router = require('express').Router();
const ctrl = require('../controllers/activityController');
router.get('/', ctrl.getAllActivities);
router.post('/register', ctrl.registerActivity);
module.exports = router;