// --- BẢO MẬT: KIỂM TRA QUYỀN TRƯỚC KHI CHẠY ---
(function checkAdminRole() {
    const userJson = localStorage.getItem('currentUser');
    if (!userJson) { window.location.href = 'index.html'; return; }
    const user = JSON.parse(userJson);
    if (user.role !== 'Admin') {
        alert("Bạn không có quyền truy cập trang Quản trị!");
        window.location.href = 'dashboard.html';
        return;
    }
})();

// --- BIẾN TOÀN CỤC LƯU TRỮ DỮ LIỆU & TRẠNG THÁI ---
let listCitizens = [];
let listActivities = [];
let currentSort = {
    citizen: { column: null, direction: 'asc' },   // direction: 'asc' hoặc 'desc'
    activity: { column: null, direction: 'asc' }
};

// --- CHUYỂN TAB ---
function switchTab(tabName) {
    document.querySelectorAll('.section').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    
    document.getElementById(`tab-${tabName}`).style.display = 'block';
    event.target.classList.add('active');

    if(tabName === 'citizens') fetchCitizens();
    if(tabName === 'activities') fetchActivities();
}

// =======================
// PHẦN 1: QUẢN LÝ CƯ DÂN
// =======================

async function fetchCitizens() {
    const search = document.getElementById('searchCitizenInput').value;
    try {
        const res = await fetch(`/api/admin/citizens?search=${encodeURIComponent(search)}`);
        listCitizens = await res.json();
        
        // Sau khi lấy dữ liệu mới, áp dụng sắp xếp hiện tại (nếu có)
        if (currentSort.citizen.column) {
            sortData(listCitizens, currentSort.citizen.column, currentSort.citizen.direction);
        }
        
        renderCitizens();
    } catch (e) { console.error(e); }
}

function renderCitizens() {
    const tbody = document.querySelector('#citizenTable tbody');
    tbody.innerHTML = listCitizens.map(c => {
        const displayDate = c.NgaySinh ? new Date(c.NgaySinh).toLocaleDateString('vi-VN') : '';
        const rawDate = c.NgaySinh ? new Date(c.NgaySinh).toISOString().split('T')[0] : '';
        return `
        <tr>
            <td>${c.CCCD}</td>
            <td>${c.HoTen}</td>
            <td>${displayDate}</td>
            <td>${c.GioiTinh || 'N/A'}</td>
            <td>
                <button class="btn-sm btn-primary" 
                    onclick="openEditCitizenModal('${c.CCCD}', '${c.HoTen}', '${rawDate}', '${c.GioiTinh}')">
                    Sửa
                </button>
            </td>
        </tr>
        `;
    }).join('');

    updateSortIcons('citizen');
}

// Logic Sửa Cư Dân
function openEditCitizenModal(cccd, hoTen, ngaySinh, gioiTinh) {
    document.getElementById('editCitizenModal').classList.remove('hidden');
    document.getElementById('editCCCD').value = cccd;
    document.getElementById('editHoTen').value = hoTen;
    document.getElementById('editNgaySinh').value = ngaySinh;
    document.getElementById('editGioiTinh').value = gioiTinh;
}

function closeEditCitizenModal() {
    document.getElementById('editCitizenModal').classList.add('hidden');
}

async function saveCitizenChanges() {
    const cccd = document.getElementById('editCCCD').value;
    const hoTen = document.getElementById('editHoTen').value;
    const ngaySinh = document.getElementById('editNgaySinh').value;
    const gioiTinh = document.getElementById('editGioiTinh').value;

    if (!hoTen) return alert("Họ tên không được để trống");

    try {
        const res = await fetch(`/api/admin/citizens/${cccd}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hoTen, ngaySinh, gioiTinh })
        });
        const data = await res.json();
        if (data.success) {
            alert("✅ Cập nhật thành công!");
            closeEditCitizenModal();
            fetchCitizens(); // Load lại
        } else {
            alert("❌ " + data.message);
        }
    } catch (error) { alert("Lỗi kết nối server"); }
}

// ===========================
// PHẦN 2: QUẢN LÝ HOẠT ĐỘNG
// ===========================

async function fetchActivities() {
    try {
        const res = await fetch('/api/activities');
        listActivities = await res.json();

        if (currentSort.activity.column) {
            sortData(listActivities, currentSort.activity.column, currentSort.activity.direction);
        }

        renderActivities();
    } catch(e) { console.error(e); }
}

function renderActivities() {
    const tbody = document.querySelector('#activityTable tbody');
    tbody.innerHTML = listActivities.map(a => `
        <tr>
            <td>${a.IdHoatDong}</td>
            <td>${a.TenHoatDong}</td>
            <td>${new Date(a.ThoiGianBatDau).toLocaleString('vi-VN')}</td>
            <td>${new Date(a.ThoiGianKetThuc).toLocaleString('vi-VN')}</td>
            <td>
                <button class="btn-sm badge-red" onclick="deleteActivity(${a.IdHoatDong})">Xóa</button>
            </td>
        </tr>
    `).join('');

    updateSortIcons('activity');
}

// Logic Thêm/Xóa Sự kiện
function openActivityModal() {
    document.getElementById('activityModal').classList.remove('hidden');
    document.getElementById('actDate').valueAsDate = new Date();
    renderTimeLine();
}
function closeActivityModal() { document.getElementById('activityModal').classList.add('hidden'); }

async function saveActivity() {
    const name = document.getElementById('actName').value;
    const date = document.getElementById('actDate').value;
    const start = document.getElementById('actStart').value;
    const end = document.getElementById('actEnd').value;
    if (!name || !date || !start || !end) return alert("Vui lòng nhập đủ thông tin");

    const startDateTime = `${date} ${start}:00`;
    const endDateTime = `${date} ${end}:00`;

    try {
        const res = await fetch('/api/admin/activities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tenHoatDong: name, thoiGianBatDau: startDateTime, thoiGianKetThuc: endDateTime })
        });
        const data = await res.json();
        if (data.success) {
            alert("Thêm thành công");
            closeActivityModal();
            fetchActivities();
        } else { alert(data.message); }
    } catch(e) { console.error(e); }
}

async function deleteActivity(id) {
    if(!confirm("Bạn chắc chắn muốn xóa sự kiện này?")) return;
    try {
        const res = await fetch(`/api/admin/activities/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if(data.success) fetchActivities();
        else alert("Lỗi xóa: " + data.message);
    } catch(e) { console.error(e); }
}

// Logic Timeline
function renderTimeLine() {
    const track = document.getElementById('timelineTrack');
    track.innerHTML = '';
    [0, 6, 12, 18, 24].forEach(hour => {
        const marker = document.createElement('div');
        marker.className = 'time-marker';
        marker.style.left = (hour / 24 * 100) + '%';
        marker.innerText = hour + 'h';
        track.appendChild(marker);
    });

    const selectedDateStr = document.getElementById('actDate').value;
    if (!selectedDateStr) return;
    const selectedDate = new Date(selectedDateStr);

    // Vẽ sự kiện đã có
    listActivities.forEach(act => {
        const start = new Date(act.ThoiGianBatDau);
        const end = new Date(act.ThoiGianKetThuc);
        if (start.toDateString() === selectedDate.toDateString()) {
            drawBlock(track, start, end, 'event-block', act.TenHoatDong);
        }
    });

    // Vẽ sự kiện đang tạo
    const timeStart = document.getElementById('actStart').value;
    const timeEnd = document.getElementById('actEnd').value;
    if (timeStart && timeEnd) {
        const previewStart = new Date(`${selectedDateStr}T${timeStart}`);
        const previewEnd = new Date(`${selectedDateStr}T${timeEnd}`);
        if (previewEnd > previewStart) {
            drawBlock(track, previewStart, previewEnd, 'event-block new-event-preview', 'Mới');
        }
    }
}

function drawBlock(container, startTime, endTime, className, label) {
    const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
    const endMinutes = endTime.getHours() * 60 + endTime.getMinutes();
    const leftPercent = (startMinutes / 1440) * 100;
    const widthPercent = ((endMinutes - startMinutes) / 1440) * 100;
    
    const el = document.createElement('div');
    el.className = className;
    el.style.left = leftPercent + '%';
    el.style.width = widthPercent + '%';
    el.title = `${label} (${startTime.toLocaleTimeString()} - ${endTime.toLocaleTimeString()})`;
    el.innerText = widthPercent > 5 ? label : '';
    container.appendChild(el);
}

// ============================
// PHẦN 3: LOGIC SẮP XẾP (SORT)
// ============================

function handleSort(type, column) {
    // 1. Cập nhật trạng thái
    const sortState = currentSort[type];
    if (sortState.column === column) {
        // Nếu click cột cũ -> Đảo chiều
        sortState.direction = sortState.direction === 'asc' ? 'desc' : 'asc';
    } else {
        // Nếu click cột mới -> Mặc định asc
        sortState.column = column;
        sortState.direction = 'asc';
    }

    // 2. Thực hiện sắp xếp mảng dữ liệu
    const dataList = type === 'citizen' ? listCitizens : listActivities;
    sortData(dataList, column, sortState.direction);

    // 3. Render lại bảng
    if (type === 'citizen') renderCitizens();
    else renderActivities();
}

function sortData(array, key, direction) {
    array.sort((a, b) => {
        let valA = a[key];
        let valB = b[key];

        // Xử lý null
        if (valA == null) valA = "";
        if (valB == null) valB = "";

        // So sánh chuỗi (Tiếng Việt)
        if (typeof valA === 'string' && typeof valB === 'string') {
            return direction === 'asc' 
                ? valA.localeCompare(valB, 'vi') 
                : valB.localeCompare(valA, 'vi');
        }
        
        // So sánh số hoặc ngày tháng
        if (valA < valB) return direction === 'asc' ? -1 : 1;
        if (valA > valB) return direction === 'asc' ? 1 : -1;
        return 0;
    });
}

// Cập nhật icon mũi tên chỉ hướng
function updateSortIcons(type) {
    const sortState = currentSort[type];
    
    // Reset tất cả icon về mặc định
    document.querySelectorAll(`[id^="sort-${type}-"]`).forEach(icon => {
        icon.textContent = '⇅'; 
        icon.style.color = '#888';
    });

    // Cập nhật icon của cột đang sort
    if (sortState.column) {
        const activeIcon = document.getElementById(`sort-${type}-${sortState.column}`);
        if (activeIcon) {
            activeIcon.textContent = sortState.direction === 'asc' ? '▲' : '▼';
            activeIcon.style.color = '#2563eb'; // Màu xanh
        }
    }
}

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    fetchCitizens();
});