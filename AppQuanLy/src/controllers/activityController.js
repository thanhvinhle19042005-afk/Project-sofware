const db = require('../config/db');

// Lấy danh sách hoạt động
exports.getAllActivities = (req, res) => {
    const sql = "SELECT * FROM HoatDong ORDER BY ThoiGianBatDau DESC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

// Đăng ký tham gia
exports.registerActivity = (req, res) => {
    const { idHoatDong, maGiaDinh, ghiChu } = req.body;
    
    // Schema yêu cầu: IdHoatDong, MaGiaDinh, GhiChu
    const sql = "INSERT INTO ThamGiaHoatDong (IdHoatDong, MaGiaDinh, GhiChu) VALUES (?, ?, ?)";
    
    db.query(sql, [idHoatDong, maGiaDinh, ghiChu], (err, result) => {
        if (err) {
            // Lỗi trùng lặp khóa chính kép (IdHoatDong + MaGiaDinh)
            if(err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: "Gia đình này đã đăng ký rồi!" });
            }
            // Lỗi khóa ngoại (Mã gia đình không tồn tại)
            if(err.code === 'ER_NO_REFERENCED_ROW_2') {
                return res.status(400).json({ message: "Mã gia đình không tồn tại trong hệ thống!" });
            }
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, message: "Đăng ký thành công!" });
    });
};