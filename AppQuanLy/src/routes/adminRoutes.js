const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Routes cho Cư Dân
router.get('/citizens', adminController.getCitizens);
router.put('/citizens/:cccd', adminController.updateCitizen);

// Routes cho Hoạt Động
router.post('/activities', adminController.addActivity);
router.delete('/activities/:id', adminController.deleteActivity);
// Reuse API lấy danh sách hoạt động từ public controller cũng được, hoặc viết thêm nếu cần lọc

module.exports = router;