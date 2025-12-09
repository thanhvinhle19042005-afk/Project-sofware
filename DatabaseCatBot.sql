CREATE TABLE BatDongSan (
    MaBDS VARCHAR(20) PRIMARY KEY,
    DiaChi NVARCHAR(255),
    CCCD_ChuSoHuu VARCHAR(12) -- Sẽ tạo FK sau khi tạo bảng NguoiDan
);

CREATE TABLE GiaDinh (
    MaGiaDinh VARCHAR(20) PRIMARY KEY,
    CCCD_ChuHo VARCHAR(12),   -- Sẽ tạo FK sau
    SoThanhVien INT DEFAULT 0,
    MaBDS VARCHAR(20),
    FOREIGN KEY (MaBDS) REFERENCES BatDongSan(MaBDS)
);

CREATE TABLE NguoiDan (
    CCCD VARCHAR(12) PRIMARY KEY,
    HoTen NVARCHAR(100),
    NgaySinh DATE,
    GioiTinh NVARCHAR(10), -- Hoặc dùng BIT nếu chỉ nam/nữ
    MaGiaDinh VARCHAR(20),
    LaTamTru BIT DEFAULT 0, -- 0: Thường trú, 1: Tạm trú
    FOREIGN KEY (MaGiaDinh) REFERENCES GiaDinh(MaGiaDinh)
);

CREATE TABLE HoatDong (
    IdHoatDong INT PRIMARY KEY AUTO_INCREMENT, -- Thay IDENTITY bằng AUTO_INCREMENT
    TenHoatDong VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci, -- Dùng utf8mb4 cho tiếng Việt
    ThoiGianBatDau DATETIME,
    ThoiGianKetThuc DATETIME
);

CREATE TABLE ThamGiaHoatDong (
    IdHoatDong INT,
    MaGiaDinh VARCHAR(20),
    GhiChu NVARCHAR(200), -- Ví dụ: Đóng góp tiền, hoặc người đại diện
    PRIMARY KEY (IdHoatDong, MaGiaDinh), -- Khóa chính kép
    FOREIGN KEY (IdHoatDong) REFERENCES HoatDong(IdHoatDong),
    FOREIGN KEY (MaGiaDinh) REFERENCES GiaDinh(MaGiaDinh)
);

CREATE TABLE TamTru (
    MaTamTru INT PRIMARY KEY AUTO_INCREMENT, -- Thay IDENTITY bằng AUTO_INCREMENT
    CCCD_NguoiThue VARCHAR(12),
    CCCD_ChuHo VARCHAR(12),
    MaBDS VARCHAR(20),
    NgayBatDau DATE,
    NgayKetThuc DATE,
    FOREIGN KEY (CCCD_NguoiThue) REFERENCES NguoiDan(CCCD),
    FOREIGN KEY (CCCD_ChuHo) REFERENCES NguoiDan(CCCD),
    FOREIGN KEY (MaBDS) REFERENCES BatDongSan(MaBDS)
);

ALTER TABLE BatDongSan
ADD CONSTRAINT FK_BDS_ChuSoHuu
FOREIGN KEY (CCCD_ChuSoHuu) REFERENCES NguoiDan(CCCD);

-- Link Chủ hộ gia đình với Người dân
ALTER TABLE GiaDinh
ADD CONSTRAINT FK_GiaDinh_ChuHo
FOREIGN KEY (CCCD_ChuHo) REFERENCES NguoiDan(CCCD);

CREATE TABLE TaiKhoan (
    MaTaiKhoan INT PRIMARY KEY AUTO_INCREMENT,
    Email VARCHAR(150) NOT NULL UNIQUE,
    MatKhau VARCHAR(255) NOT NULL,
    PhanQuyen NVARCHAR(50) DEFAULT 'CongDan' -- Ví dụ: Admin, CongDan

);