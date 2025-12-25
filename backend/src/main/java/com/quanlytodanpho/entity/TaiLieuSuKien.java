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
@Table(name = "TaiLieuSuKien")
public class TaiLieuSuKien {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaTaiLieu")
    private Integer maTaiLieu;
    
    @Column(name = "MaSuKien", nullable = false)
    private Integer maSuKien;
    
    @Column(name = "TenTaiLieu", length = 200, nullable = false)
    private String tenTaiLieu;
    
    @Column(name = "LoaiTaiLieu", length = 50)
    private String loaiTaiLieu;
    
    @Column(name = "DuongDan", length = 500, nullable = false)
    private String duongDan;
    
    @Column(name = "KichThuoc")
    private Long kichThuoc;
    
    @Column(name = "MoTa", length = 500)
    private String moTa;
    
    @Column(name = "NguoiUploadID", length = 12)
    private String nguoiUploadId;
    
    @Column(name = "NgayUpload")
    private LocalDateTime ngayUpload = LocalDateTime.now();
}
