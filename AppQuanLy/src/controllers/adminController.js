// src/controllers/adminController.js
const db = require('../config/db');

// 1. Lấy danh sách cư dân (kèm tìm kiếm)
exports.getCitizens = (req, res) => {
    const search = req.query.search || '';
    const sql = `
        SELECT * FROM NguoiDan 
        WHERE HoTen LIKE ? OR CCCD LIKE ? 
        ORDER BY HoTen ASC
    `;
    db.query(sql, [`%${search}%`, `%${search}%`], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

// 2. Cập nhật thông tin cư dân
exports.updateCitizen = (req, res) => {
    const { cccd } = req.params;
    const { hoTen, ngaySinh, gioiTinh } = req.body;
    const sql = "UPDATE NguoiDan SET HoTen = ?, NgaySinh = ?, GioiTinh = ? WHERE CCCD = ?";
    db.query(sql, [hoTen, ngaySinh, gioiTinh, cccd], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Cập nhật thành công' });
    });
};

// 3. Thêm sự kiện mới
exports.addActivity = (req, res) => {
    const { tenHoatDong, thoiGianBatDau, thoiGianKetThuc } = req.body;
    const sql = "INSERT INTO HoatDong (TenHoatDong, ThoiGianBatDau, ThoiGianKetThuc) VALUES (?, ?, ?)";
    db.query(sql, [tenHoatDong, thoiGianBatDau, thoiGianKetThuc], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Thêm sự kiện thành công' });
    });
};

// 4. Xóa sự kiện
exports.deleteActivity = (req, res) => {
    const { id } = req.params;
    // Xóa dữ liệu trong bảng tham gia trước để tránh lỗi khóa ngoại
    db.query("DELETE FROM ThamGiaHoatDong WHERE IdHoatDong = ?", [id], (err) => {
        if(err) console.log("Lỗi xóa tham gia:", err);
        
        // Sau đó xóa hoạt động chính
        db.query("DELETE FROM HoatDong WHERE IdHoatDong = ?", [id], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, message: 'Đã xóa sự kiện' });
        });
    });
};