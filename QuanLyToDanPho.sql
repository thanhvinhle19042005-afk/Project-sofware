-- =============================================
-- DATABASE: QUẢN LÝ TỔ DÂN PHỐ
-- Chức năng 4: Quản lý lịch sinh hoạt / họp tổ dân phố
-- Ngày tạo: 03/12/2025
-- =============================================

CREATE DATABASE QuanLyToDanPho;
GO

USE QuanLyToDanPho;
GO

-- =============================================
-- PHẦN 1: TẠO CÁC BẢNG DỮ LIỆU CHÍNH
-- =============================================

-- 1. Bảng Bất động sản (tạo trước vì được tham chiếu bởi GiaDinh)
CREATE TABLE BatDongSan (
    MaBDS VARCHAR(20) PRIMARY KEY,
    DiaChiDiaLy NVARCHAR(500) NOT NULL,
    CCCD_ChuSoHuu VARCHAR(12) NULL,
    NgayTao DATETIME DEFAULT GETDATE(),
    NgayCapNhat DATETIME DEFAULT GETDATE()
);
GO

-- 2. Bảng Gia đình
CREATE TABLE GiaDinh (
    MaGiaDinh VARCHAR(20) PRIMARY KEY,
    CCCD_ChuHo VARCHAR(12) NULL,
    SoThanhVien INT DEFAULT 0,
    MaBDS VARCHAR(20) NULL,
    NgayTao DATETIME DEFAULT GETDATE(),
    NgayCapNhat DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_GiaDinh_BatDongSan FOREIGN KEY (MaBDS) 
        REFERENCES BatDongSan(MaBDS)
        ON UPDATE NO ACTION
        ON DELETE SET NULL
);
GO

-- 3. Bảng Người dân (Bảng chính)
CREATE TABLE NguoiDan (
    CCCD VARCHAR(12) PRIMARY KEY,
    HoTen NVARCHAR(100) NOT NULL,
    NgaySinh DATE NOT NULL,
    ThangSinh AS MONTH(NgaySinh) PERSISTED,
    GioiTinh NVARCHAR(10) NOT NULL 
        CONSTRAINT CHK_GioiTinh CHECK (GioiTinh IN (N'Nam', N'Nữ', N'Khác')),
    MaGiaDinh VARCHAR(20) NULL,
    TamChu BIT DEFAULT 0,
    SoDienThoai VARCHAR(15) NULL,
    Email VARCHAR(100) NULL,
    NgayTao DATETIME DEFAULT GETDATE(),
    NgayCapNhat DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_NguoiDan_GiaDinh FOREIGN KEY (MaGiaDinh) 
        REFERENCES GiaDinh(MaGiaDinh)
        ON UPDATE NO ACTION
        ON DELETE SET NULL
);
GO

-- Thêm FK cho BatDongSan và GiaDinh (sau khi tạo NguoiDan)
ALTER TABLE BatDongSan
ADD CONSTRAINT FK_BatDongSan_ChuSoHuu FOREIGN KEY (CCCD_ChuSoHuu) 
    REFERENCES NguoiDan(CCCD)
    ON UPDATE NO ACTION
    ON DELETE SET NULL;
GO

ALTER TABLE GiaDinh
ADD CONSTRAINT FK_GiaDinh_ChuHo FOREIGN KEY (CCCD_ChuHo) 
    REFERENCES NguoiDan(CCCD)
    ON UPDATE NO ACTION
    ON DELETE SET NULL;
GO

-- 4. Bảng Tạm trú
CREATE TABLE TamTru (
    MaTamTru INT IDENTITY(1,1) PRIMARY KEY,
    CCCD_NguoiThue VARCHAR(12) NOT NULL,
    CCCD_ChuHo VARCHAR(12) NOT NULL,
    ThoiGianBatDau DATE NOT NULL,
    ThoiGianKetThuc DATE NULL,
    MaBDS VARCHAR(20) NOT NULL,
    TrangThai NVARCHAR(20) DEFAULT N'Đang tạm trú'
        CONSTRAINT CHK_TrangThaiTamTru CHECK (TrangThai IN (N'Đang tạm trú', N'Đã kết thúc')),
    NgayTao DATETIME DEFAULT GETDATE(),
    NgayCapNhat DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_TamTru_NguoiThue FOREIGN KEY (CCCD_NguoiThue) 
        REFERENCES NguoiDan(CCCD)
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT FK_TamTru_ChuHo FOREIGN KEY (CCCD_ChuHo) 
        REFERENCES NguoiDan(CCCD)
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT FK_TamTru_BatDongSan FOREIGN KEY (MaBDS) 
        REFERENCES BatDongSan(MaBDS)
        ON UPDATE CASCADE
        ON DELETE NO ACTION,
    CONSTRAINT CHK_ThoiGianTamTru CHECK (ThoiGianKetThuc IS NULL OR ThoiGianKetThuc >= ThoiGianBatDau)
);
GO

-- =============================================
-- PHẦN 2: BẢNG SỰ KIỆN / HOẠT ĐỘNG (Events)
-- =============================================

-- 5. Bảng Sự kiện / Cuộc họp (Events)
CREATE TABLE SuKien (
    MaSuKien INT IDENTITY(1,1) PRIMARY KEY,
    TenSuKien NVARCHAR(200) NOT NULL,
    MoTa NVARCHAR(MAX) NULL,
    NoiDung NVARCHAR(MAX) NULL,
    ThoiGianBatDau DATETIME NOT NULL,
    ThoiGianKetThuc DATETIME NOT NULL,
    DiaDiem NVARCHAR(500) NULL,
    LoaiSuKien NVARCHAR(50) DEFAULT N'Họp tổ dân phố'
        CONSTRAINT CHK_LoaiSuKien CHECK (LoaiSuKien IN (
            N'Họp tổ dân phố', 
            N'Sinh hoạt cộng đồng', 
            N'Sự kiện văn hóa',
            N'Họp khẩn cấp',
            N'Khác'
        )),
    SoLuongToiDa INT NULL,
    TrangThai NVARCHAR(30) DEFAULT N'Chờ phê duyệt'
        CONSTRAINT CHK_TrangThaiSuKien CHECK (TrangThai IN (
            N'Chờ phê duyệt', 
            N'Đã phê duyệt', 
            N'Đang diễn ra', 
            N'Hoàn thành', 
            N'Hủy bỏ'
        )),
    NguoiTaoID VARCHAR(12) NULL,
    NgayTao DATETIME DEFAULT GETDATE(),
    NgayCapNhat DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_SuKien_NguoiTao FOREIGN KEY (NguoiTaoID) 
        REFERENCES NguoiDan(CCCD)
        ON UPDATE NO ACTION
        ON DELETE SET NULL,
    CONSTRAINT CHK_ThoiGianSuKien CHECK (ThoiGianKetThuc >= ThoiGianBatDau)
);
GO

-- 6. Bảng Đối tượng mời tham dự (để xác định mời hộ nào)
CREATE TABLE DoiTuongMoi (
    MaDoiTuong INT IDENTITY(1,1) PRIMARY KEY,
    MaSuKien INT NOT NULL,
    MaGiaDinh VARCHAR(20) NULL,      -- Mời theo gia đình
    MaBDS VARCHAR(20) NULL,           -- Mời theo khu vực BĐS (ví dụ: dãy A)
    TatCa BIT DEFAULT 0,              -- Mời tất cả
    GhiChu NVARCHAR(500) NULL,
    CONSTRAINT FK_DoiTuongMoi_SuKien FOREIGN KEY (MaSuKien) 
        REFERENCES SuKien(MaSuKien)
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT FK_DoiTuongMoi_GiaDinh FOREIGN KEY (MaGiaDinh) 
        REFERENCES GiaDinh(MaGiaDinh)
        ON UPDATE NO ACTION
        ON DELETE SET NULL,
    CONSTRAINT FK_DoiTuongMoi_BDS FOREIGN KEY (MaBDS) 
        REFERENCES BatDongSan(MaBDS)
        ON UPDATE NO ACTION
        ON DELETE SET NULL
);
GO

-- 7. Bảng Đăng ký tham gia sự kiện
CREATE TABLE DangKySuKien (
    MaDangKy INT IDENTITY(1,1) PRIMARY KEY,
    MaSuKien INT NOT NULL,
    CCCD_NguoiDangKy VARCHAR(12) NOT NULL,
    MaGiaDinh VARCHAR(20) NULL,
    ThoiGianDangKy DATETIME DEFAULT GETDATE(),
    TrangThai NVARCHAR(30) DEFAULT N'Đã đăng ký'
        CONSTRAINT CHK_TrangThaiDangKy CHECK (TrangThai IN (
            N'Đã đăng ký', 
            N'Đã tham gia', 
            N'Vắng mặt', 
            N'Hủy đăng ký'
        )),
    GhiChu NVARCHAR(500) NULL,
    CONSTRAINT FK_DangKySuKien_SuKien FOREIGN KEY (MaSuKien) 
        REFERENCES SuKien(MaSuKien)
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT FK_DangKySuKien_NguoiDan FOREIGN KEY (CCCD_NguoiDangKy) 
        REFERENCES NguoiDan(CCCD)
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT FK_DangKySuKien_GiaDinh FOREIGN KEY (MaGiaDinh) 
        REFERENCES GiaDinh(MaGiaDinh)
        ON UPDATE NO ACTION
        ON DELETE SET NULL,
    CONSTRAINT UQ_DangKySuKien UNIQUE (MaSuKien, CCCD_NguoiDangKy)
);
GO

-- 8. Bảng Tài liệu đính kèm sự kiện
CREATE TABLE TaiLieuSuKien (
    MaTaiLieu INT IDENTITY(1,1) PRIMARY KEY,
    MaSuKien INT NOT NULL,
    TenTaiLieu NVARCHAR(200) NOT NULL,
    LoaiTaiLieu NVARCHAR(50) NULL,  -- PDF, DOC, XLS, IMG,...
    DuongDan NVARCHAR(500) NOT NULL,
    KichThuoc BIGINT NULL,           -- Bytes
    MoTa NVARCHAR(500) NULL,
    NguoiUploadID VARCHAR(12) NULL,
    NgayUpload DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_TaiLieuSuKien_SuKien FOREIGN KEY (MaSuKien) 
        REFERENCES SuKien(MaSuKien)
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT FK_TaiLieuSuKien_NguoiUpload FOREIGN KEY (NguoiUploadID) 
        REFERENCES NguoiDan(CCCD)
        ON UPDATE NO ACTION
        ON DELETE SET NULL
);
GO

-- 9. Bảng Biên bản cuộc họp
CREATE TABLE BienBanCuocHop (
    MaBienBan INT IDENTITY(1,1) PRIMARY KEY,
    MaSuKien INT NOT NULL UNIQUE,   -- Mỗi sự kiện chỉ có 1 biên bản
    TieuDe NVARCHAR(200) NOT NULL,
    NoiDungBienBan NVARCHAR(MAX) NOT NULL,
    KetLuan NVARCHAR(MAX) NULL,
    SoNguoiThamGia INT DEFAULT 0,
    SoHoThamGia INT DEFAULT 0,
    NguoiLapID VARCHAR(12) NULL,
    NgayLap DATETIME DEFAULT GETDATE(),
    TrangThai NVARCHAR(30) DEFAULT N'Nháp'
        CONSTRAINT CHK_TrangThaiBienBan CHECK (TrangThai IN (N'Nháp', N'Đã duyệt', N'Công bố')),
    NgayCapNhat DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_BienBan_SuKien FOREIGN KEY (MaSuKien) 
        REFERENCES SuKien(MaSuKien)
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT FK_BienBan_NguoiLap FOREIGN KEY (NguoiLapID) 
        REFERENCES NguoiDan(CCCD)
        ON UPDATE NO ACTION
        ON DELETE SET NULL
);
GO

-- 10. Bảng Theo dõi hộ tham gia cuộc họp
CREATE TABLE HoThamGia (
    MaHoThamGia INT IDENTITY(1,1) PRIMARY KEY,
    MaBienBan INT NOT NULL,
    MaGiaDinh VARCHAR(20) NOT NULL,
    CCCD_NguoiDaiDien VARCHAR(12) NULL,  -- Người đại diện hộ tham gia
    ThoiGianDiemDanh DATETIME DEFAULT GETDATE(),
    GhiChu NVARCHAR(500) NULL,
    CONSTRAINT FK_HoThamGia_BienBan FOREIGN KEY (MaBienBan) 
        REFERENCES BienBanCuocHop(MaBienBan)
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT FK_HoThamGia_GiaDinh FOREIGN KEY (MaGiaDinh) 
        REFERENCES GiaDinh(MaGiaDinh)
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT FK_HoThamGia_NguoiDaiDien FOREIGN KEY (CCCD_NguoiDaiDien) 
        REFERENCES NguoiDan(CCCD)
        ON UPDATE NO ACTION
        ON DELETE SET NULL,
    CONSTRAINT UQ_HoThamGia UNIQUE (MaBienBan, MaGiaDinh)
);
GO

-- =============================================
-- PHẦN 3: BẢNG QUẢN LÝ TÀI KHOẢN
-- =============================================

-- 11. Bảng Vai trò
CREATE TABLE VaiTro (
    MaVaiTro INT IDENTITY(1,1) PRIMARY KEY,
    TenVaiTro NVARCHAR(50) NOT NULL UNIQUE
        CONSTRAINT CHK_TenVaiTro CHECK (TenVaiTro IN (N'Admin', N'User')),
    MoTa NVARCHAR(200) NULL
);
GO

-- 12. Bảng Tài khoản
CREATE TABLE TaiKhoan (
    MaTaiKhoan INT IDENTITY(1,1) PRIMARY KEY,
    TenDangNhap VARCHAR(50) NOT NULL UNIQUE,
    MatKhau VARCHAR(255) NOT NULL,
    CCCD VARCHAR(12) NULL,
    MaVaiTro INT NOT NULL,
    TrangThai BIT DEFAULT 1,
    LanDangNhapCuoi DATETIME NULL,
    NgayTao DATETIME DEFAULT GETDATE(),
    NgayCapNhat DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_TaiKhoan_NguoiDan FOREIGN KEY (CCCD) 
        REFERENCES NguoiDan(CCCD)
        ON UPDATE NO ACTION
        ON DELETE SET NULL,
    CONSTRAINT FK_TaiKhoan_VaiTro FOREIGN KEY (MaVaiTro) 
        REFERENCES VaiTro(MaVaiTro)
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);
GO

-- =============================================
-- PHẦN 4: HỆ THỐNG THÔNG BÁO
-- =============================================

-- 13. Bảng Loại thông báo
CREATE TABLE LoaiThongBao (
    MaLoai INT IDENTITY(1,1) PRIMARY KEY,
    TenLoai NVARCHAR(50) NOT NULL UNIQUE
        CONSTRAINT CHK_TenLoaiThongBao CHECK (TenLoai IN (N'Passive', N'Active')),
    MoTa NVARCHAR(200) NULL
);
GO

-- 14. Bảng Thông báo
CREATE TABLE ThongBao (
    MaThongBao INT IDENTITY(1,1) PRIMARY KEY,
    TieuDe NVARCHAR(200) NOT NULL,
    NoiDung NVARCHAR(MAX) NOT NULL,
    MaLoai INT NOT NULL,
    MaSuKien INT NULL,               -- Liên kết với sự kiện nếu có
    NguoiGuiID INT NULL,
    DoKhan NVARCHAR(20) DEFAULT N'Bình thường'
        CONSTRAINT CHK_DoKhan CHECK (DoKhan IN (N'Bình thường', N'Quan trọng', N'Khẩn cấp')),
    GuiEmail BIT DEFAULT 0,
    ThoiGianGui DATETIME DEFAULT GETDATE(),
    ThoiGianHetHan DATETIME NULL,
    TrangThai NVARCHAR(20) DEFAULT N'Đã gửi'
        CONSTRAINT CHK_TrangThaiThongBao CHECK (TrangThai IN (N'Nháp', N'Đã gửi', N'Hết hạn')),
    NgayTao DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_ThongBao_LoaiThongBao FOREIGN KEY (MaLoai) 
        REFERENCES LoaiThongBao(MaLoai)
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT FK_ThongBao_SuKien FOREIGN KEY (MaSuKien) 
        REFERENCES SuKien(MaSuKien)
        ON UPDATE NO ACTION
        ON DELETE SET NULL,
    CONSTRAINT FK_ThongBao_NguoiGui FOREIGN KEY (NguoiGuiID) 
        REFERENCES TaiKhoan(MaTaiKhoan)
        ON UPDATE NO ACTION
        ON DELETE SET NULL
);
GO

-- 15. Bảng Người nhận thông báo
CREATE TABLE NguoiNhanThongBao (
    MaNhanThongBao INT IDENTITY(1,1) PRIMARY KEY,
    MaThongBao INT NOT NULL,
    CCCD_NguoiNhan VARCHAR(12) NOT NULL,
    DaDoc BIT DEFAULT 0,
    ThoiGianDoc DATETIME NULL,
    DaGuiEmail BIT DEFAULT 0,
    ThoiGianGuiEmail DATETIME NULL,
    EmailStatus NVARCHAR(50) NULL,   -- Pending, Sent, Failed
    CONSTRAINT FK_NguoiNhanThongBao_ThongBao FOREIGN KEY (MaThongBao) 
        REFERENCES ThongBao(MaThongBao)
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT FK_NguoiNhanThongBao_NguoiDan FOREIGN KEY (CCCD_NguoiNhan) 
        REFERENCES NguoiDan(CCCD)
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT UQ_NguoiNhanThongBao UNIQUE (MaThongBao, CCCD_NguoiNhan)
);
GO

-- =============================================
-- PHẦN 5: BẢNG LỊCH (Calendar View)
-- =============================================

-- 16. Bảng Lịch (View tổng hợp các sự kiện)
CREATE TABLE Lich (
    MaLich INT IDENTITY(1,1) PRIMARY KEY,
    TieuDe NVARCHAR(200) NOT NULL,
    MoTa NVARCHAR(MAX) NULL,
    NgayBatDau DATETIME NOT NULL,
    NgayKetThuc DATETIME NOT NULL,
    MaSuKien INT NULL,
    MauHienThi VARCHAR(20) DEFAULT '#007bff',  -- Màu hiển thị trên lịch
    HienThiCongKhai BIT DEFAULT 1,
    NguoiTaoID INT NULL,
    NgayTao DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Lich_SuKien FOREIGN KEY (MaSuKien) 
        REFERENCES SuKien(MaSuKien)
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT FK_Lich_NguoiTao FOREIGN KEY (NguoiTaoID) 
        REFERENCES TaiKhoan(MaTaiKhoan)
        ON UPDATE NO ACTION
        ON DELETE SET NULL,
    CONSTRAINT CHK_ThoiGianLich CHECK (NgayKetThuc >= NgayBatDau)
);
GO

-- =============================================
-- PHẦN 6: BẢNG LOG HỆ THỐNG
-- =============================================

-- 17. Bảng Log hệ thống
CREATE TABLE LogHeThong (
    MaLog INT IDENTITY(1,1) PRIMARY KEY,
    MaTaiKhoan INT NULL,
    HanhDong NVARCHAR(100) NOT NULL,
    BangLienQuan NVARCHAR(50) NULL,
    MaBanGhi VARCHAR(50) NULL,
    ChiTiet NVARCHAR(MAX) NULL,
    DiaChiIP VARCHAR(50) NULL,
    ThoiGian DATETIME DEFAULT GETDATE()
);
GO

-- =============================================
-- PHẦN 7: TẠO INDEXES
-- =============================================

-- Indexes cho bảng NguoiDan
CREATE INDEX IX_NguoiDan_MaGiaDinh ON NguoiDan(MaGiaDinh);
CREATE INDEX IX_NguoiDan_TamChu ON NguoiDan(TamChu);
CREATE INDEX IX_NguoiDan_HoTen ON NguoiDan(HoTen);

-- Indexes cho bảng SuKien
CREATE INDEX IX_SuKien_TrangThai ON SuKien(TrangThai);
CREATE INDEX IX_SuKien_ThoiGian ON SuKien(ThoiGianBatDau, ThoiGianKetThuc);
CREATE INDEX IX_SuKien_LoaiSuKien ON SuKien(LoaiSuKien);

-- Indexes cho bảng DangKySuKien
CREATE INDEX IX_DangKySuKien_MaSuKien ON DangKySuKien(MaSuKien);
CREATE INDEX IX_DangKySuKien_CCCD ON DangKySuKien(CCCD_NguoiDangKy);
CREATE INDEX IX_DangKySuKien_TrangThai ON DangKySuKien(TrangThai);

-- Indexes cho bảng ThongBao
CREATE INDEX IX_ThongBao_ThoiGianGui ON ThongBao(ThoiGianGui);
CREATE INDEX IX_ThongBao_MaSuKien ON ThongBao(MaSuKien);
CREATE INDEX IX_ThongBao_DoKhan ON ThongBao(DoKhan);

-- Indexes cho bảng NguoiNhanThongBao
CREATE INDEX IX_NguoiNhanThongBao_DaDoc ON NguoiNhanThongBao(DaDoc);

-- Indexes cho bảng TamTru
CREATE INDEX IX_TamTru_ThoiGian ON TamTru(ThoiGianBatDau, ThoiGianKetThuc);
CREATE INDEX IX_TamTru_TrangThai ON TamTru(TrangThai);

-- Indexes cho bảng Lich
CREATE INDEX IX_Lich_NgayBatDau ON Lich(NgayBatDau);
CREATE INDEX IX_Lich_HienThiCongKhai ON Lich(HienThiCongKhai);
GO

-- =============================================
-- PHẦN 8: TẠO VIEWS
-- =============================================

-- View: Danh sách tất cả người dân
CREATE VIEW vw_DanhSachNguoiDan
AS
SELECT 
    nd.CCCD,
    nd.HoTen,
    nd.NgaySinh,
    nd.ThangSinh,
    nd.GioiTinh,
    nd.MaGiaDinh,
    gd.CCCD_ChuHo,
    (SELECT HoTen FROM NguoiDan WHERE CCCD = gd.CCCD_ChuHo) AS TenChuHo,
    nd.TamChu,
    CASE WHEN nd.TamChu = 1 THEN N'Tạm trú' ELSE N'Thường trú' END AS TinhTrangCuTru,
    nd.SoDienThoai,
    nd.Email,
    bds.DiaChiDiaLy AS DiaChi
FROM NguoiDan nd
LEFT JOIN GiaDinh gd ON nd.MaGiaDinh = gd.MaGiaDinh
LEFT JOIN BatDongSan bds ON gd.MaBDS = bds.MaBDS;
GO

-- View: Danh sách sự kiện sắp tới
CREATE VIEW vw_SuKienSapToi
AS
SELECT 
    sk.MaSuKien,
    sk.TenSuKien,
    sk.MoTa,
    sk.ThoiGianBatDau,
    sk.ThoiGianKetThuc,
    sk.DiaDiem,
    sk.LoaiSuKien,
    sk.TrangThai,
    sk.SoLuongToiDa,
    (SELECT COUNT(*) FROM DangKySuKien WHERE MaSuKien = sk.MaSuKien AND TrangThai != N'Hủy đăng ký') AS SoNguoiDangKy,
    nd.HoTen AS NguoiTao
FROM SuKien sk
LEFT JOIN NguoiDan nd ON sk.NguoiTaoID = nd.CCCD
WHERE sk.ThoiGianBatDau >= GETDATE() 
  AND sk.TrangThai IN (N'Đã phê duyệt', N'Đang diễn ra');
GO

-- View: Thống kê sự kiện theo tháng/năm
CREATE VIEW vw_ThongKeSuKien
AS
SELECT 
    YEAR(ThoiGianBatDau) AS Nam,
    MONTH(ThoiGianBatDau) AS Thang,
    COUNT(*) AS TongSoSuKien,
    SUM(CASE WHEN TrangThai = N'Hoàn thành' THEN 1 ELSE 0 END) AS DaHoanThanh,
    SUM(CASE WHEN TrangThai = N'Hủy bỏ' THEN 1 ELSE 0 END) AS DaHuyBo,
    SUM(CASE WHEN LoaiSuKien = N'Họp tổ dân phố' THEN 1 ELSE 0 END) AS SoHopToDanPho,
    SUM(CASE WHEN LoaiSuKien = N'Sinh hoạt cộng đồng' THEN 1 ELSE 0 END) AS SoSinhHoat
FROM SuKien
GROUP BY YEAR(ThoiGianBatDau), MONTH(ThoiGianBatDau);
GO

-- View: Thống kê người tham gia sự kiện
CREATE VIEW vw_ThongKeNguoiThamGia
AS
SELECT 
    sk.MaSuKien,
    sk.TenSuKien,
    sk.ThoiGianBatDau,
    sk.LoaiSuKien,
    COUNT(dk.MaDangKy) AS TongDangKy,
    SUM(CASE WHEN dk.TrangThai = N'Đã tham gia' THEN 1 ELSE 0 END) AS DaThamGia,
    SUM(CASE WHEN dk.TrangThai = N'Vắng mặt' THEN 1 ELSE 0 END) AS VangMat,
    CAST(
        CASE WHEN COUNT(dk.MaDangKy) > 0 
        THEN (SUM(CASE WHEN dk.TrangThai = N'Đã tham gia' THEN 1.0 ELSE 0 END) / COUNT(dk.MaDangKy)) * 100 
        ELSE 0 END 
    AS DECIMAL(5,2)) AS TyLeThamGia
FROM SuKien sk
LEFT JOIN DangKySuKien dk ON sk.MaSuKien = dk.MaSuKien
GROUP BY sk.MaSuKien, sk.TenSuKien, sk.ThoiGianBatDau, sk.LoaiSuKien;
GO

-- View: Lịch sử hoạt động của người dân
CREATE VIEW vw_LichSuHoatDong
AS
SELECT 
    dk.CCCD_NguoiDangKy AS CCCD,
    nd.HoTen,
    nd.MaGiaDinh,
    sk.MaSuKien,
    sk.TenSuKien,
    sk.LoaiSuKien,
    sk.ThoiGianBatDau,
    sk.ThoiGianKetThuc,
    sk.DiaDiem,
    dk.ThoiGianDangKy,
    dk.TrangThai AS TrangThaiThamGia
FROM DangKySuKien dk
INNER JOIN NguoiDan nd ON dk.CCCD_NguoiDangKy = nd.CCCD
INNER JOIN SuKien sk ON dk.MaSuKien = sk.MaSuKien;
GO

-- View: Hoạt động trong gia đình
CREATE VIEW vw_HoatDongGiaDinh
AS
SELECT 
    gd.MaGiaDinh,
    (SELECT HoTen FROM NguoiDan WHERE CCCD = gd.CCCD_ChuHo) AS TenChuHo,
    nd.CCCD,
    nd.HoTen AS TenThanhVien,
    sk.MaSuKien,
    sk.TenSuKien,
    sk.ThoiGianBatDau,
    sk.ThoiGianKetThuc,
    dk.TrangThai AS TrangThaiThamGia
FROM GiaDinh gd
INNER JOIN NguoiDan nd ON nd.MaGiaDinh = gd.MaGiaDinh
INNER JOIN DangKySuKien dk ON dk.CCCD_NguoiDangKy = nd.CCCD
INNER JOIN SuKien sk ON dk.MaSuKien = sk.MaSuKien;
GO

-- View: Thống kê tạm trú
CREATE VIEW vw_ThongKeTamTru
AS
SELECT 
    YEAR(ThoiGianBatDau) AS Nam,
    MONTH(ThoiGianBatDau) AS Thang,
    COUNT(*) AS TongSoTamTru,
    SUM(CASE WHEN TrangThai = N'Đang tạm trú' THEN 1 ELSE 0 END) AS DangTamTru,
    SUM(CASE WHEN TrangThai = N'Đã kết thúc' THEN 1 ELSE 0 END) AS DaKetThuc
FROM TamTru
GROUP BY YEAR(ThoiGianBatDau), MONTH(ThoiGianBatDau);
GO

-- View: Thống kê số lượng người theo thời gian
CREATE VIEW vw_ThongKeNguoiDan
AS
SELECT 
    YEAR(NgayTao) AS Nam,
    MONTH(NgayTao) AS Thang,
    COUNT(*) AS SoLuongMoi,
    SUM(CASE WHEN TamChu = 0 THEN 1 ELSE 0 END) AS ThuongTru,
    SUM(CASE WHEN TamChu = 1 THEN 1 ELSE 0 END) AS TamTru
FROM NguoiDan
GROUP BY YEAR(NgayTao), MONTH(NgayTao);
GO

-- =============================================
-- PHẦN 9: TẠO TRIGGERS
-- =============================================

-- Trigger: Tự động cập nhật số thành viên gia đình
CREATE TRIGGER trg_CapNhatSoThanhVien
ON NguoiDan
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Cập nhật cho gia đình có thay đổi (từ inserted)
    UPDATE GiaDinh
    SET SoThanhVien = (SELECT COUNT(*) FROM NguoiDan WHERE MaGiaDinh = GiaDinh.MaGiaDinh),
        NgayCapNhat = GETDATE()
    WHERE MaGiaDinh IN (SELECT DISTINCT MaGiaDinh FROM inserted WHERE MaGiaDinh IS NOT NULL);
    
    -- Cập nhật cho gia đình cũ (từ deleted)
    UPDATE GiaDinh
    SET SoThanhVien = (SELECT COUNT(*) FROM NguoiDan WHERE MaGiaDinh = GiaDinh.MaGiaDinh),
        NgayCapNhat = GETDATE()
    WHERE MaGiaDinh IN (SELECT DISTINCT MaGiaDinh FROM deleted WHERE MaGiaDinh IS NOT NULL);
END;
GO

-- Trigger: Tự động tạo lịch khi sự kiện được phê duyệt
CREATE TRIGGER trg_TaoLichKhiPheDuyet
ON SuKien
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO Lich (TieuDe, MoTa, NgayBatDau, NgayKetThuc, MaSuKien, HienThiCongKhai)
    SELECT 
        i.TenSuKien,
        i.MoTa,
        i.ThoiGianBatDau,
        i.ThoiGianKetThuc,
        i.MaSuKien,
        1
    FROM inserted i
    INNER JOIN deleted d ON i.MaSuKien = d.MaSuKien
    WHERE i.TrangThai = N'Đã phê duyệt' 
      AND d.TrangThai = N'Chờ phê duyệt'
      AND NOT EXISTS (SELECT 1 FROM Lich WHERE MaSuKien = i.MaSuKien);
END;
GO

-- Trigger: Tự động gửi thông báo khi sự kiện được phê duyệt
CREATE TRIGGER trg_GuiThongBaoSuKien
ON SuKien
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @MaSuKien INT, @TenSuKien NVARCHAR(200), @ThoiGianBatDau DATETIME, @DiaDiem NVARCHAR(500);
    DECLARE @MaThongBao INT;
    
    -- Lấy thông tin sự kiện vừa được phê duyệt
    SELECT @MaSuKien = i.MaSuKien, 
           @TenSuKien = i.TenSuKien, 
           @ThoiGianBatDau = i.ThoiGianBatDau,
           @DiaDiem = i.DiaDiem
    FROM inserted i
    INNER JOIN deleted d ON i.MaSuKien = d.MaSuKien
    WHERE i.TrangThai = N'Đã phê duyệt' AND d.TrangThai = N'Chờ phê duyệt';
    
    IF @MaSuKien IS NOT NULL
    BEGIN
        -- Tạo thông báo tự động (Passive)
        INSERT INTO ThongBao (TieuDe, NoiDung, MaLoai, MaSuKien, DoKhan)
        VALUES (
            N'Thông báo sự kiện: ' + @TenSuKien,
            N'Kính mời quý cư dân tham gia sự kiện "' + @TenSuKien + 
            N'" vào lúc ' + CONVERT(NVARCHAR, @ThoiGianBatDau, 120) +
            CASE WHEN @DiaDiem IS NOT NULL THEN N' tại ' + @DiaDiem ELSE N'' END,
            1, -- Passive
            @MaSuKien,
            N'Quan trọng'
        );
        
        SET @MaThongBao = SCOPE_IDENTITY();
        
        -- Gửi đến tất cả chủ hộ
        INSERT INTO NguoiNhanThongBao (MaThongBao, CCCD_NguoiNhan)
        SELECT @MaThongBao, CCCD_ChuHo
        FROM GiaDinh
        WHERE CCCD_ChuHo IS NOT NULL;
    END
END;
GO

-- Trigger: Cập nhật số hộ/người tham gia trong biên bản
CREATE TRIGGER trg_CapNhatBienBan
ON HoThamGia
AFTER INSERT, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Cập nhật số liệu biên bản
    UPDATE BienBanCuocHop
    SET SoHoThamGia = (SELECT COUNT(DISTINCT MaGiaDinh) FROM HoThamGia WHERE MaBienBan = BienBanCuocHop.MaBienBan),
        SoNguoiThamGia = (SELECT COUNT(*) FROM HoThamGia WHERE MaBienBan = BienBanCuocHop.MaBienBan),
        NgayCapNhat = GETDATE()
    WHERE MaBienBan IN (
        SELECT DISTINCT MaBienBan FROM inserted
        UNION
        SELECT DISTINCT MaBienBan FROM deleted
    );
END;
GO

-- =============================================
-- PHẦN 10: STORED PROCEDURES
-- =============================================

-- SP: Admin tạo sự kiện mới
CREATE PROCEDURE sp_TaoSuKien
    @TenSuKien NVARCHAR(200),
    @MoTa NVARCHAR(MAX) = NULL,
    @NoiDung NVARCHAR(MAX) = NULL,
    @ThoiGianBatDau DATETIME,
    @ThoiGianKetThuc DATETIME,
    @DiaDiem NVARCHAR(500) = NULL,
    @LoaiSuKien NVARCHAR(50) = N'Họp tổ dân phố',
    @SoLuongToiDa INT = NULL,
    @NguoiTaoID VARCHAR(12) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @ThoiGianKetThuc < @ThoiGianBatDau
    BEGIN
        SELECT 0 AS KetQua, N'Thời gian kết thúc phải sau thời gian bắt đầu' AS ThongBao;
        RETURN;
    END
    
    INSERT INTO SuKien (TenSuKien, MoTa, NoiDung, ThoiGianBatDau, ThoiGianKetThuc, DiaDiem, LoaiSuKien, SoLuongToiDa, NguoiTaoID)
    VALUES (@TenSuKien, @MoTa, @NoiDung, @ThoiGianBatDau, @ThoiGianKetThuc, @DiaDiem, @LoaiSuKien, @SoLuongToiDa, @NguoiTaoID);
    
    SELECT 1 AS KetQua, N'Tạo sự kiện thành công' AS ThongBao, SCOPE_IDENTITY() AS MaSuKien;
END;
GO

-- SP: Phê duyệt sự kiện
CREATE PROCEDURE sp_PheDuyetSuKien
    @MaSuKien INT,
    @TrangThai NVARCHAR(30)
AS
BEGIN
    SET NOCOUNT ON;
    
    IF NOT EXISTS (SELECT 1 FROM SuKien WHERE MaSuKien = @MaSuKien)
    BEGIN
        SELECT 0 AS KetQua, N'Sự kiện không tồn tại' AS ThongBao;
        RETURN;
    END
    
    UPDATE SuKien 
    SET TrangThai = @TrangThai,
        NgayCapNhat = GETDATE()
    WHERE MaSuKien = @MaSuKien;
    
    SELECT 1 AS KetQua, N'Cập nhật trạng thái thành công' AS ThongBao;
END;
GO

-- SP: Đăng ký tham gia sự kiện
CREATE PROCEDURE sp_DangKySuKien
    @MaSuKien INT,
    @CCCD VARCHAR(12),
    @GhiChu NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @MaGiaDinh VARCHAR(20), @SoLuongToiDa INT, @SoLuongHienTai INT;
    
    -- Lấy mã gia đình
    SELECT @MaGiaDinh = MaGiaDinh FROM NguoiDan WHERE CCCD = @CCCD;
    
    -- Kiểm tra sự kiện đã được phê duyệt chưa
    IF NOT EXISTS (SELECT 1 FROM SuKien WHERE MaSuKien = @MaSuKien AND TrangThai IN (N'Đã phê duyệt', N'Đang diễn ra'))
    BEGIN
        SELECT 0 AS KetQua, N'Sự kiện chưa được phê duyệt hoặc không tồn tại' AS ThongBao;
        RETURN;
    END
    
    -- Kiểm tra đã đăng ký chưa
    IF EXISTS (SELECT 1 FROM DangKySuKien WHERE MaSuKien = @MaSuKien AND CCCD_NguoiDangKy = @CCCD AND TrangThai != N'Hủy đăng ký')
    BEGIN
        SELECT 0 AS KetQua, N'Bạn đã đăng ký sự kiện này rồi' AS ThongBao;
        RETURN;
    END
    
    -- Kiểm tra số lượng
    SELECT @SoLuongToiDa = SoLuongToiDa FROM SuKien WHERE MaSuKien = @MaSuKien;
    SELECT @SoLuongHienTai = COUNT(*) FROM DangKySuKien WHERE MaSuKien = @MaSuKien AND TrangThai NOT IN (N'Hủy đăng ký', N'Vắng mặt');
    
    IF @SoLuongToiDa IS NOT NULL AND @SoLuongHienTai >= @SoLuongToiDa
    BEGIN
        SELECT 0 AS KetQua, N'Sự kiện đã đủ số lượng người tham gia' AS ThongBao;
        RETURN;
    END
    
    INSERT INTO DangKySuKien (MaSuKien, CCCD_NguoiDangKy, MaGiaDinh, GhiChu)
    VALUES (@MaSuKien, @CCCD, @MaGiaDinh, @GhiChu);
    
    SELECT 1 AS KetQua, N'Đăng ký tham gia thành công' AS ThongBao;
END;
GO

-- SP: Gửi thông báo đến các hộ cụ thể (ví dụ: chỉ dãy A)
CREATE PROCEDURE sp_GuiThongBaoTheoKhuVuc
    @TieuDe NVARCHAR(200),
    @NoiDung NVARCHAR(MAX),
    @MaLoai INT,
    @MaSuKien INT = NULL,
    @NguoiGuiID INT = NULL,
    @DoKhan NVARCHAR(20) = N'Bình thường',
    @GuiEmail BIT = 0,
    @MaBDS VARCHAR(20) = NULL,       -- Gửi theo khu vực BĐS
    @DanhSachCCCD VARCHAR(MAX) = NULL -- Danh sách CCCD cách nhau bởi dấu phẩy
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @MaThongBao INT;
    
    INSERT INTO ThongBao (TieuDe, NoiDung, MaLoai, MaSuKien, NguoiGuiID, DoKhan, GuiEmail)
    VALUES (@TieuDe, @NoiDung, @MaLoai, @MaSuKien, @NguoiGuiID, @DoKhan, @GuiEmail);
    
    SET @MaThongBao = SCOPE_IDENTITY();
    
    -- Gửi theo khu vực BĐS
    IF @MaBDS IS NOT NULL
    BEGIN
        INSERT INTO NguoiNhanThongBao (MaThongBao, CCCD_NguoiNhan)
        SELECT @MaThongBao, nd.CCCD
        FROM NguoiDan nd
        INNER JOIN GiaDinh gd ON nd.MaGiaDinh = gd.MaGiaDinh
        WHERE gd.MaBDS = @MaBDS;
    END
    -- Gửi theo danh sách CCCD cụ thể
    ELSE IF @DanhSachCCCD IS NOT NULL
    BEGIN
        INSERT INTO NguoiNhanThongBao (MaThongBao, CCCD_NguoiNhan)
        SELECT @MaThongBao, TRIM(value) 
        FROM STRING_SPLIT(@DanhSachCCCD, ',')
        WHERE TRIM(value) IN (SELECT CCCD FROM NguoiDan);
    END
    -- Gửi tất cả chủ hộ
    ELSE
    BEGIN
        INSERT INTO NguoiNhanThongBao (MaThongBao, CCCD_NguoiNhan)
        SELECT @MaThongBao, CCCD_ChuHo
        FROM GiaDinh
        WHERE CCCD_ChuHo IS NOT NULL;
    END
    
    SELECT 1 AS KetQua, N'Gửi thông báo thành công' AS ThongBao, @MaThongBao AS MaThongBao,
           (SELECT COUNT(*) FROM NguoiNhanThongBao WHERE MaThongBao = @MaThongBao) AS SoNguoiNhan;
END;
GO

-- SP: Tạo biên bản cuộc họp
CREATE PROCEDURE sp_TaoBienBan
    @MaSuKien INT,
    @TieuDe NVARCHAR(200),
    @NoiDungBienBan NVARCHAR(MAX),
    @KetLuan NVARCHAR(MAX) = NULL,
    @NguoiLapID VARCHAR(12) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    IF NOT EXISTS (SELECT 1 FROM SuKien WHERE MaSuKien = @MaSuKien)
    BEGIN
        SELECT 0 AS KetQua, N'Sự kiện không tồn tại' AS ThongBao;
        RETURN;
    END
    
    IF EXISTS (SELECT 1 FROM BienBanCuocHop WHERE MaSuKien = @MaSuKien)
    BEGIN
        SELECT 0 AS KetQua, N'Biên bản đã tồn tại cho sự kiện này' AS ThongBao;
        RETURN;
    END
    
    INSERT INTO BienBanCuocHop (MaSuKien, TieuDe, NoiDungBienBan, KetLuan, NguoiLapID)
    VALUES (@MaSuKien, @TieuDe, @NoiDungBienBan, @KetLuan, @NguoiLapID);
    
    SELECT 1 AS KetQua, N'Tạo biên bản thành công' AS ThongBao, SCOPE_IDENTITY() AS MaBienBan;
END;
GO

-- SP: Điểm danh hộ tham gia
CREATE PROCEDURE sp_DiemDanhHoThamGia
    @MaBienBan INT,
    @MaGiaDinh VARCHAR(20),
    @CCCD_NguoiDaiDien VARCHAR(12) = NULL,
    @GhiChu NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    IF EXISTS (SELECT 1 FROM HoThamGia WHERE MaBienBan = @MaBienBan AND MaGiaDinh = @MaGiaDinh)
    BEGIN
        SELECT 0 AS KetQua, N'Hộ này đã được điểm danh' AS ThongBao;
        RETURN;
    END
    
    INSERT INTO HoThamGia (MaBienBan, MaGiaDinh, CCCD_NguoiDaiDien, GhiChu)
    VALUES (@MaBienBan, @MaGiaDinh, @CCCD_NguoiDaiDien, @GhiChu);
    
    SELECT 1 AS KetQua, N'Điểm danh thành công' AS ThongBao;
END;
GO

-- SP: Đăng nhập
CREATE PROCEDURE sp_DangNhap
    @TenDangNhap VARCHAR(50),
    @MatKhau VARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @MaTaiKhoan INT, @TrangThai BIT;
    
    SELECT @MaTaiKhoan = MaTaiKhoan, @TrangThai = TrangThai
    FROM TaiKhoan 
    WHERE TenDangNhap = @TenDangNhap AND MatKhau = @MatKhau;
    
    IF @MaTaiKhoan IS NULL
    BEGIN
        SELECT 0 AS KetQua, N'Tên đăng nhập hoặc mật khẩu không đúng' AS ThongBao;
        RETURN;
    END
    
    IF @TrangThai = 0
    BEGIN
        SELECT 0 AS KetQua, N'Tài khoản đã bị khóa' AS ThongBao;
        RETURN;
    END
    
    UPDATE TaiKhoan SET LanDangNhapCuoi = GETDATE() WHERE MaTaiKhoan = @MaTaiKhoan;
    
    SELECT 1 AS KetQua, N'Đăng nhập thành công' AS ThongBao, 
           tk.MaTaiKhoan, tk.TenDangNhap, tk.CCCD, vt.TenVaiTro,
           nd.HoTen, nd.MaGiaDinh
    FROM TaiKhoan tk
    INNER JOIN VaiTro vt ON tk.MaVaiTro = vt.MaVaiTro
    LEFT JOIN NguoiDan nd ON tk.CCCD = nd.CCCD
    WHERE tk.MaTaiKhoan = @MaTaiKhoan;
END;
GO

-- SP: Xem lịch sử hoạt động của người dân
CREATE PROCEDURE sp_XemLichSuHoatDong
    @CCCD VARCHAR(12)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT * FROM vw_LichSuHoatDong
    WHERE CCCD = @CCCD
    ORDER BY ThoiGianBatDau DESC;
END;
GO

-- SP: Xem hoạt động trong gia đình
CREATE PROCEDURE sp_XemHoatDongGiaDinh
    @MaGiaDinh VARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT * FROM vw_HoatDongGiaDinh
    WHERE MaGiaDinh = @MaGiaDinh
    ORDER BY ThoiGianBatDau DESC;
END;
GO

PRINT N'=== TẠO DATABASE QUẢN LÝ TỔ DÂN PHỐ THÀNH CÔNG ===';
GO
