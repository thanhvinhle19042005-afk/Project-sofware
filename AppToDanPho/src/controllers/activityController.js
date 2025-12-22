// src/controllers/activityController.js
const db = require('../config/db');

// Lấy danh sách hoạt động
exports.getAllActivities = (req, res) => {
    const sql = "SELECT * FROM HoatDong ORDER BY ThoiGianBatDau DESC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

// Đăng ký hoạt động
exports.registerActivity = (req, res) => {
    const { idHoatDong, maGiaDinh, ghiChu } = req.body;
    
    const sql = "INSERT INTO ThamGiaHoatDong (IdHoatDong, MaGiaDinh, GhiChu) VALUES (?, ?, ?)";
    db.query(sql, [idHoatDong, maGiaDinh, ghiChu], (err, result) => {
        if (err) {
            if(err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: "Gia đình bạn đã đăng ký hoạt động này rồi!" });
            }
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, message: "Đăng ký thành công!" });
    });
};