const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Zanhminhmc01', // Điền mật khẩu MySQL của bạn
    database: 'residentmanagement' // Tên DB bạn đã tạo
});

db.connect(err => {
    if (err) console.error(' Lỗi kết nối DB:', err.message);
    else console.log(' Đã kết nối MySQL thành công');
});

module.exports = db;