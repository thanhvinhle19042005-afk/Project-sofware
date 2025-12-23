// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Import các routes
const authRoutes = require('./src/routes/authRoutes');
const activityRoutes = require('./src/routes/activityRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

const app = express();
const PORT = 3000;

// --- Middleware ---
app.use(cors());
app.use(bodyParser.json());

// Cấu hình phục vụ file tĩnh (Frontend) từ thư mục 'public'
app.use(express.static(path.join(__dirname, 'public')));

// --- Routes API ---
// Các API liên quan đến Auth sẽ có tiền tố /api/auth
app.use('/api/auth', authRoutes);

// Các API liên quan đến Activity sẽ có tiền tố /api/activities
app.use('/api/activities', activityRoutes);
app.use('/api/admin', adminRoutes);

// --- Khởi chạy Server ---
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});