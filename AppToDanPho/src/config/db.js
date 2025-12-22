// src/config/db.js
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      // Thay bằng tên thiết lập trong mysql
    password: '123456',      // Thay bằng pass trong mysql
    database: 'residentmanagement' //thay bằng tên bảng đã tạo
});

db.connect((err) => {
    if (err) {
        console.error('Lỗi kết nối CSDL:', err.message);
        return;
    }
    console.log('Đã kết nối thành công tới MySQL');
});

module.exports = db;