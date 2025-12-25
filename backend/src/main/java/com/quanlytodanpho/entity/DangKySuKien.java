package com.quanlytodanpho.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "DangKySuKien")
public class DangKySuKien {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaDangKy")
    private Integer maDangKy;
    
    @Column(name = "MaSuKien", nullable = false)
    private Integer maSuKien;
    
    @Column(name = "CCCD_NguoiDangKy", length = 12, nullable = false)
    private String cccdNguoiDangKy;
    
    @Column(name = "MaGiaDinh", length = 20)
    private String maGiaDinh;
    
    @Column(name = "ThoiGianDangKy")
    private LocalDateTime thoiGianDangKy = LocalDateTime.now();
    
    @Column(name = "TrangThai", length = 30)
    private String trangThai = "Đã đăng ký";
    
    @Column(name = "GhiChu", length = 500)
    private String ghiChu;
}
