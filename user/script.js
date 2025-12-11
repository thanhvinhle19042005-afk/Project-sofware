/* ==========================================================================
    ĐĂNG NHẬP 
   ========================================================================== */
class NeumorphismLoginForm {
    constructor() {
        this.form = document.getElementById('loginForm');
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
        if(this.passwordToggle) this.setupPasswordToggle();
        this.setupNeumorphicEffects();
    }
    
    bindEvents() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Input validation events
        this.emailInput.addEventListener('blur', () => this.validateEmail());
        this.passwordInput.addEventListener('blur', () => this.validatePassword());
        this.emailInput.addEventListener('input', () => this.clearError('email'));
        this.passwordInput.addEventListener('input', () => this.clearError('password'));
        
        // Soft press effects
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
        if(!card) return;
        
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
        setTimeout(() => element.style.transform = 'scale(1)', 150);
    }
    
    validateEmail() {
        const email = this.emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) { this.showError('email', 'Vui lòng nhập email'); return false; }
        // Tạm bỏ check regex chặt để dễ demo
        // if (!emailRegex.test(email)) { this.showError('email', 'Email không hợp lệ'); return false; }
        this.clearError('email');
        return true;
    }
    
    validatePassword() {
        const password = this.passwordInput.value;
        if (!password) { this.showError('password', 'Vui lòng nhập mật khẩu'); return false; }
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
    }
    
    setLoading(loading) {
        this.submitButton.classList.toggle('loading', loading);
        this.submitButton.disabled = loading;
        this.socialButtons.forEach(btn => {
            btn.style.pointerEvents = loading ? 'none' : 'auto';
            btn.style.opacity = loading ? '0.6' : '1';
        });
    }

    // --- LOGIC XỬ LÝ SUBMIT VÀ ĐIỀU HƯỚNG ---
    async handleSubmit(e) {
        e.preventDefault();
        
        const isEmailValid = this.validateEmail();
        const isPasswordValid = this.validatePassword();
        
        if (!isEmailValid || !isPasswordValid) {
            this.animateSoftPress(this.submitButton);
            return;
        }
        
        this.setLoading(true);
        
        const email = this.emailInput.value.trim();
        const password = this.passwordInput.value;
        let targetRole = null;

        // Giả lập check DB
        if (email === 'admin@demo.com' && password === '123456') {
            targetRole = 'admin';
        } else if (email === 'user@demo.com' && password === '123456') {
            targetRole = 'user';
        }

        // Giả lập delay mạng
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (targetRole) {
            // Đăng nhập thành công -> Gọi hiệu ứng chuyển trang
            this.showNeumorphicSuccess(targetRole);
        } else {
            // Đăng nhập thất bại
            this.showError('password', 'Sai tài khoản hoặc mật khẩu (Thử: admin@demo.com / 123456)');
            this.setLoading(false);
        }
    }
    
    showNeumorphicSuccess(role) {
        // Hiệu ứng fade out form
        this.form.style.transform = 'scale(0.95)';
        this.form.style.opacity = '0';
        
        setTimeout(() => {
            this.form.style.display = 'none';
            const signupLink = document.querySelector('.signup-link');
            if(signupLink) signupLink.style.display = 'none';
            
            this.successMessage.classList.add('show');
            const successIcon = this.successMessage.querySelector('.neu-icon');
            if(successIcon) successIcon.style.animation = 'successPulse 0.6s ease-out';
        }, 300);
        
        // Chuyển hướng với URL parameter
        setTimeout(() => {
            window.location.href = `dashboard.html?role=${role}`;
        }, 2000);
    }
}

// Add custom animations css dynamically
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

/* ==========================================================================
   PHẦN 2: LOGIC DASHBOARD (HIỂN THỊ DỮ LIỆU & NAVIGATION)
   ========================================================================== */

let currentUserData = null;

// Khởi tạo chung khi trang tải xong
document.addEventListener('DOMContentLoaded', () => {
    // 1. Nếu ở trang Login
    if (document.getElementById('loginForm')) {
        new NeumorphismLoginForm();
    }

    // 2. Nếu ở trang Dashboard
    if (document.querySelector('.app-body')) {
        setupDashboardData();
        initDropdownEvent();
        initNavigation();
    }
});

function setupDashboardData() {
    // Lấy tham số ?role=... trên URL
    const urlParams = new URLSearchParams(window.location.search);
    const role = urlParams.get('role'); // 'admin' hoặc 'user'

    // Dữ liệu mẫu
    const mockDB = {
        admin: {
            name: 'Nguyễn Quản Lý',
            role: 'Tổ trưởng',
            email: 'admin@demo.com',
            cccd: '001099009999',
            address: 'Nhà văn hóa Tổ dân phố'
        },
        user: {
            name: 'Trần Văn Dân',
            role: 'Cư dân',
            email: 'user@demo.com',
            cccd: '034095001234',
            address: 'Số 15, Ngõ 3, Đường Hạnh Phúc'
        }
    };

    // Mặc định là user nếu không có role hợp lệ
    currentUserData = mockDB[role] || mockDB['user'];

    // Điền lên giao diện
    if (currentUserData) {
        const elName = document.getElementById('displayUserName');
        const elRole = document.getElementById('displayUserRole');
        const elAvatar = document.getElementById('displayUserAvatar');
        
        if(elName) elName.textContent = currentUserData.name;
        if(elRole) elRole.textContent = currentUserData.role;
        if(elAvatar) elAvatar.textContent = currentUserData.name.charAt(0);
        
        // Điền vào Dropdown menu
        const ddName = document.getElementById('dropdownName');
        const ddEmail = document.getElementById('dropdownEmail');
        if(ddName) ddName.textContent = currentUserData.name;
        if(ddEmail) ddEmail.textContent = currentUserData.email;
    }
}

// Xử lý Navigation Tab (Sidebar)
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.section');
    const logoBtn = document.querySelector('.sidebar-logo');
    const sidebar = document.getElementById('sidebarMenu');

    // Mobile toggle
    if(logoBtn && sidebar) {
        logoBtn.addEventListener('click', () => sidebar.classList.toggle('hidden'));
    }

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

// Xử lý Dropdown User
function initDropdownEvent() {
    const userBtn = document.getElementById('userMenuBtn');
    const dropdown = document.getElementById('userDropdown');

    if(userBtn && dropdown) {
        userBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });

        document.addEventListener('click', () => {
            dropdown.classList.remove('show');
        });
    }
}

// --- MODAL FUNCTIONS (Global scope để gọi từ HTML onclick) ---

function showUserProfile() {
    const modal = document.getElementById('profileModal');
    const content = document.getElementById('profileContent');

    if (currentUserData && content) {
        content.innerHTML = `
            <div class="profile-row">
                <span class="profile-label">Họ tên</span>
                <span class="profile-value">${currentUserData.name}</span>
            </div>
            <div class="profile-row">
                <span class="profile-label">Email</span>
                <span class="profile-value">${currentUserData.email}</span>
            </div>
            <div class="profile-row">
                <span class="profile-label">Vai trò</span>
                <span class="profile-value">${currentUserData.role}</span>
            </div>
            <div class="profile-row">
                <span class="profile-label">CCCD</span>
                <span class="profile-value">${currentUserData.cccd}</span>
            </div>
            <div class="profile-row">
                <span class="profile-label">Địa chỉ</span>
                <span class="profile-value">${currentUserData.address}</span>
            </div>
        `;
        modal.classList.remove('hidden');
    }
}

function closeProfileModal() {
    const modal = document.getElementById('profileModal');
    if(modal) modal.classList.add('hidden');
}

function handleLogout() {
    window.location.href = 'index.html';
}

// Logic Modal Đăng ký hoạt động
let currentActivity = null;

function openModal(activityName) {
    currentActivity = activityName;
    const title = document.getElementById("modalTitle");
    const modal = document.getElementById("modal");
    if(title && modal) {
        title.textContent = "Đăng ký: " + activityName;
        modal.classList.remove("hidden");
    }
}

function closeModal() {
    const modal = document.getElementById("modal");
    if(modal) modal.classList.add("hidden");
    currentActivity = null;
}

function confirmRegister() {
    if(currentActivity) alert("Đã đăng ký: " + currentActivity);
    closeModal();
}