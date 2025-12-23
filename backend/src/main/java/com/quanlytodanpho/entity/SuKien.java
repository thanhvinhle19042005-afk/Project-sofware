package com.quanlytodanpho.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "SuKien")
@EntityListeners(AuditingEntityListener.class)
public class SuKien {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaSuKien")
    private Integer maSuKien;
    
    @Column(name = "TenSuKien", length = 200, nullable = false)
    private String tenSuKien;
    
    @Column(name = "MoTa", columnDefinition = "TEXT")
    private String moTa;
    
    @Column(name = "NoiDung", columnDefinition = "TEXT")
    private String noiDung;
    
    @Column(name = "ThoiGianBatDau", nullable = false)
    private LocalDateTime thoiGianBatDau;
    
    @Column(name = "ThoiGianKetThuc", nullable = false)
    private LocalDateTime thoiGianKetThuc;
    
    @Column(name = "DiaDiem", length = 500)
    private String diaDiem;
    
    @Column(name = "LoaiSuKien", length = 50)
    private String loaiSuKien = "Họp tổ dân phố";
    
    @Column(name = "SoLuongToiDa")
    private Integer soLuongToiDa;
    
    @Column(name = "TrangThai", length = 30)
    private String trangThai = "Chờ phê duyệt";
    
    @Column(name = "NguoiTaoID", length = 12)
    private String nguoiTaoId;
    
    @CreatedDate
    @Column(name = "NgayTao", nullable = false, updatable = false)
    private LocalDateTime ngayTao;
    
    @LastModifiedDate
    @Column(name = "NgayCapNhat")
    private LocalDateTime ngayCapNhat;
}
