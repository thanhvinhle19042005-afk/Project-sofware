/**
 * CLASS QUẢN LÝ LOGIN FORM (NEUMORPHISM STYLE)
 */
class NeumorphismLoginForm {
    constructor() {
        this.form = document.getElementById('loginForm');
        // Nếu không tìm thấy form (tức là đang ở trang Dashboard), thì dừng lại
        if (!this.form) return;
        
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.passwordToggle = document.getElementById('passwordToggle');
        this.submitButton = this.form.querySelector('.login-btn');
        this.successMessage = document.getElementById('successMessage');
        this.socialButtons = document.querySelectorAll('.neu-social');
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.setupPasswordToggle();
        this.setupNeumorphicEffects();
        
        // Kiểm tra nếu đã login rồi thì chuyển luôn sang dashboard
        const userJson = localStorage.getItem('currentUser');
        if (userJson) {
            const user = JSON.parse(userJson);
            // Kiểm tra quyền để điều hướng đúng trang
            if (user.role === 'Admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        }
    }
    
    bindEvents() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.emailInput.addEventListener('blur', () => this.validateEmail());
        this.passwordInput.addEventListener('blur', () => this.validatePassword());
        this.emailInput.addEventListener('input', () => this.clearError('email'));
        this.passwordInput.addEventListener('input', () => this.clearError('password'));
        
        [this.emailInput, this.passwordInput].forEach(input => {
            input.addEventListener('focus', (e) => this.addSoftPress(e));
            input.addEventListener('blur', (e) => this.removeSoftPress(e));
        });
    }
    
    setupPasswordToggle() {
        this.passwordToggle.addEventListener('click', () => {
            const type = this.passwordInput.type === 'password' ? 'text' : 'password';
            this.passwordInput.type = type;
            this.passwordToggle.classList.toggle('show-password', type === 'text');
            this.animateSoftPress(this.passwordToggle);
        });
    }
    
    setupNeumorphicEffects() {
        const neuElements = document.querySelectorAll('.neu-icon, .neu-checkbox, .neu-social');
        neuElements.forEach(element => {
            element.addEventListener('mouseenter', () => element.style.transform = 'scale(1.05)');
            element.addEventListener('mouseleave', () => element.style.transform = 'scale(1)');
        });
        
        document.addEventListener('mousemove', (e) => this.updateAmbientLight(e));
    }
    
    updateAmbientLight(e) {
        const card = document.querySelector('.login-card');
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const angleX = (x - centerX) / centerX;
        const angleY = (y - centerY) / centerY;
        const shadowX = angleX * 30;
        const shadowY = angleY * 30;
        
        card.style.boxShadow = `
            ${shadowX}px ${shadowY}px 60px #bec3cf,
            ${-shadowX}px ${-shadowY}px 60px #ffffff
        `;
    }
    
    addSoftPress(e) { e.target.closest('.neu-input').style.transform = 'scale(0.98)'; }
    removeSoftPress(e) { e.target.closest('.neu-input').style.transform = 'scale(1)'; }
    
    animateSoftPress(element) {
        element.style.transform = 'scale(0.95)';
        setTimeout(() => { element.style.transform = 'scale(1)'; }, 150);
    }
    
    validateEmail() {
        const email = this.emailInput.value.trim();
        // Regex đơn giản cho email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email) { this.showError('email', 'Vui lòng nhập Email'); return false; }
        // Bỏ qua check regex quá chặt để dễ test
        // if (!emailRegex.test(email)) { this.showError('email', 'Email không hợp lệ'); return false; }
        
        this.clearError('email');
        return true;
    }
    
    validatePassword() {
        const password = this.passwordInput.value;
        if (!password) { this.showError('password', 'Vui lòng nhập Mật khẩu'); return false; }
        if (password.length < 6) { this.showError('password', 'Mật khẩu phải từ 6 ký tự'); return false; }
        this.clearError('password');
        return true;
    }
    
    showError(field, message) {
        const formGroup = document.getElementById(field).closest('.form-group');
        const errorElement = document.getElementById(`${field}Error`);
        formGroup.classList.add('error');
        errorElement.textContent = message;
        errorElement.classList.add('show');
        const input = document.getElementById(field);
        input.style.animation = 'gentleShake 0.5s ease-in-out';
        setTimeout(() => input.style.animation = '', 500);
    }
    
    clearError(field) {
        const formGroup = document.getElementById(field).closest('.form-group');
        const errorElement = document.getElementById(`${field}Error`);
        formGroup.classList.remove('error');
        errorElement.classList.remove('show');
        setTimeout(() => errorElement.textContent = '', 300);
    }
    
    setLoading(loading) {
        this.submitButton.classList.toggle('loading', loading);
        this.submitButton.disabled = loading;
    }

    // --- LOGIC GỌI API ĐĂNG NHẬP MỚI ---
    async handleSubmit(e) {
        e.preventDefault();
        
        const isEmailValid = this.validateEmail();
        const isPasswordValid = this.validatePassword();
        
        if (!isEmailValid || !isPasswordValid) {
            this.animateSoftPress(this.submitButton);
            return;
        }
        
        this.setLoading(true);
        
        const email = this.emailInput.value;
        const password = this.passwordInput.value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                
                // --- SỬA ĐOẠN NÀY: Xác định đích đến dựa trên Role ---
                let targetUrl = 'dashboard.html'; // Mặc định là dân
                if (data.user.role === 'Admin') {
                    targetUrl = 'admin.html';
                }
                
                // Truyền link đích vào hàm hiệu ứng
                this.showNeumorphicSuccess(targetUrl);
                // -----------------------------------------------------

            } else {
                this.showError('password', data.message || 'Đăng nhập thất bại');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('password', 'Không thể kết nối tới Server.');
        } finally {
            this.setLoading(false);
        }
    }
    
    showNeumorphicSuccess(redirectUrl) { 
        this.form.style.transform = 'scale(0.95)';
        this.form.style.opacity = '0';
        
        setTimeout(() => {
            this.form.style.display = 'none';
            document.querySelector('.signup-link').style.display = 'none';
            this.successMessage.classList.add('show');
            const successIcon = this.successMessage.querySelector('.neu-icon');
            successIcon.style.animation = 'successPulse 0.6s ease-out';
        }, 300);
        
        // Chuyển hướng sau 2 giây
        setTimeout(() => {
            window.location.href = redirectUrl; // Dùng link được truyền vào
        }, 2000);
    }
}

/**
 * CÁC HÀM XỬ LÝ CHO DASHBOARD
 */

// Biến lưu trữ ID hoạt động đang chọn để đăng ký
let currentActivityId = null;
let currentActivityName = null;

function initDashboard() {
    // 1. Kiểm tra login
    const userJson = localStorage.getItem('currentUser');
    if (!userJson) {
        // Chưa login -> đá về trang chủ
        window.location.href = 'index.html';
        return;
    }

    const user = JSON.parse(userJson);
    
    // 2. Hiển thị thông tin user lên Header
    const userNameEl = document.querySelector('.user-name');
    const userRoleEl = document.querySelector('.user-role');
    if (userNameEl) userNameEl.textContent = user.email.split('@')[0]; // Lấy tên trước @
    if (userRoleEl) userRoleEl.textContent = user.role;

    // 3. Khởi tạo Navigation (Chuyển tab)
    initDashboardNavigation();
    
    // 4. Load dữ liệu Hoạt động từ API
    loadActivities();
}

function initDashboardNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.section');
    const sidebarNav = document.getElementById('sidebarMenu');
    const logoBtn = document.querySelector('.sidebar-logo');

    // Toggle menu mobile
    if(logoBtn && sidebarNav) {
        logoBtn.addEventListener('click', () => {
            sidebarNav.classList.toggle('hidden');
        });
    }

    // Tab switching
    if (!navItems.length) return;
    navItems.forEach((btn) => {
        btn.addEventListener('click', () => {
            navItems.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');

            const sectionName = btn.dataset.section;
            sections.forEach((sec) => sec.classList.remove('active'));
            const target = document.getElementById('section-' + sectionName);
            if (target) target.classList.add('active');
        });
    });
}

// Hàm tải danh sách hoạt động từ Server
async function loadActivities() {
    const tableBody = document.querySelector('#activities-table tbody');
    if (!tableBody) return; // Không tìm thấy bảng thì thoát

    // Hiển thị loading tạm thời
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Đang tải dữ liệu...</td></tr>`;

    try {
        const response = await fetch('/api/activities');
        const activities = await response.json();

        if (!activities || activities.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 20px; color: #888;">
                        Chưa có hoạt động nào.
                    </td>
                </tr>`;
            return;
        }

        let html = '';
        const now = new Date();

        activities.forEach(act => {
            // Format thời gian hiển thị
            const startDate = new Date(act.ThoiGianBatDau);
            const endDate = new Date(act.ThoiGianKetThuc);
            
            const dateStr = startDate.toLocaleDateString('vi-VN');
            const timeStr = startDate.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});

            // Logic trạng thái
            let statusBadge = '';
            let actionBtn = '';

            if (now > endDate) {
                statusBadge = '<span class="badge badge-gray">Đã kết thúc</span>';
                actionBtn = '<button class="btn-outline btn-sm" disabled>Đã đóng</button>';
            } else if (now < startDate) {
                statusBadge = '<span class="badge badge-orange">Sắp diễn ra</span>';
                actionBtn = `<button class="btn-primary btn-sm" onclick="openModal('${act.TenHoatDong}', ${act.IdHoatDong})">Đăng ký</button>`;
            } else {
                statusBadge = '<span class="badge badge-green">Đang diễn ra</span>';
                actionBtn = `<button class="btn-primary btn-sm" onclick="openModal('${act.TenHoatDong}', ${act.IdHoatDong})">Đăng ký</button>`;
            }

            html += `
                <tr>
                    <td style="font-weight: 500; color: #1f2937;">${act.TenHoatDong}</td>
                    <td>${timeStr} - ${dateStr}</td>
                    <td>Nhà văn hóa</td>
                    <td>--</td>
                    <td>${statusBadge}</td>
                    <td>${actionBtn}</td>
                </tr>
            `;
        });

        tableBody.innerHTML = html;

    } catch (error) {
        console.error("Lỗi tải hoạt động:", error);
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">Lỗi kết nối server</td></tr>`;
    }
}

// Mở Modal
function openModal(activityName, activityId) {
    const modal = document.getElementById('modal');
    const title = document.getElementById('modalTitle');
    if (!modal) return;

    currentActivityName = activityName;
    currentActivityId = activityId; // Lưu ID để gửi API
    
    if(title) title.textContent = 'Đăng ký: ' + activityName;
    modal.classList.remove('hidden');
}

// Đóng Modal
function closeModal() {
    const modal = document.getElementById('modal');
    if (!modal) return;
    modal.classList.add('hidden');
    currentActivityId = null;
    currentActivityName = null;
}

// Xác nhận đăng ký (Gọi API)
async function confirmRegister() {
    if (!currentActivityId) return;
    
    // Lấy user từ localStorage (để sau này có thể check user id)
    const user = JSON.parse(localStorage.getItem('currentUser'));

    // Giả định Mã Gia Đình (Trong thực tế bạn cần query bảng User -> lấy MaGiaDinh)
    // Ở đây demo fix cứng GD001 để test database
    const maGiaDinhDemo = 'GD001'; 

    try {
        const res = await fetch('/api/activities/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                idHoatDong: currentActivityId,
                maGiaDinh: maGiaDinhDemo,
                ghiChu: `Đăng ký bởi ${user ? user.email : 'App'}`
            })
        });

        const data = await res.json();

        if (data.success) {
            alert("✅ " + data.message);
            closeModal();
            // (Tuỳ chọn) Load lại bảng để cập nhật trạng thái nếu cần
        } else {
            alert("⚠️ " + data.message);
        }

    } catch (err) {
        console.error(err);
        alert("❌ Lỗi kết nối đến server.");
    }
}

// Thêm Animation Keyframes vào trang nếu chưa có
if (!document.querySelector('#neu-keyframes')) {
    const style = document.createElement('style');
    style.id = 'neu-keyframes';
    style.textContent = `
        @keyframes gentleShake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-3px); }
            75% { transform: translateX(3px); }
        }
        @keyframes successPulse {
            0% { transform: scale(0.8); opacity: 0; }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
}

// --- KHỞI CHẠY KHI DOM SẴN SÀNG ---
document.addEventListener('DOMContentLoaded', () => {
    // Kiểm tra xem đang ở trang nào
    if (document.body.classList.contains('page-login')) {
        new NeumorphismLoginForm();
        
        // Nút logout giả (nếu người dùng back lại trang login)
        localStorage.removeItem('currentUser'); 
    } 
    else if (document.querySelector('.sidebar')) { // Dấu hiệu trang Dashboard
        initDashboard();
    }
});

// Expose functions to global scope (cho HTML onclick)
window.openModal = openModal;
window.closeModal = closeModal;
window.confirmRegister = confirmRegister;