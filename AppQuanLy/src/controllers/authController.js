const db = require('../config/db');

exports.login = (req, res) => {
    const { email, password } = req.body;
    // Schema: TaiKhoan (Email, MatKhau, PhanQuyen)
    const sql = "SELECT * FROM TaiKhoan WHERE Email = ? AND MatKhau = ?";
    
    db.query(sql, [email, password], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (results.length > 0) {
            const user = results[0];
            res.json({ 
                success: true, 
                message: "Đăng nhập thành công",
                user: {
                    id: user.MaTaiKhoan,
                    email: user.Email,
                    role: user.PhanQuyen
                }
            });
        } else {
            res.status(401).json({ success: false, message: "Email hoặc mật khẩu không đúng" });
        }
    });
};