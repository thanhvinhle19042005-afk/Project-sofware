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
@Table(name = "TaiKhoan")
@EntityListeners(AuditingEntityListener.class)
public class TaiKhoan {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaTaiKhoan")
    private Integer maTaiKhoan;
    
    @Column(name = "TenDangNhap", length = 50, nullable = false, unique = true)
    private String tenDangNhap;
    
    @Column(name = "MatKhau", length = 255, nullable = false)
    private String matKhau;
    
    @Column(name = "CCCD", length = 12)
    private String cccd;
    
    @Column(name = "MaVaiTro", nullable = false)
    private Integer maVaiTro;
    
    @Column(name = "TrangThai")
    private Boolean trangThai = true;
    
    @Column(name = "LanDangNhapCuoi")
    private LocalDateTime lanDangNhapCuoi;
    
    @CreatedDate
    @Column(name = "NgayTao", nullable = false, updatable = false)
    private LocalDateTime ngayTao;
    
    @LastModifiedDate
    @Column(name = "NgayCapNhat")
    private LocalDateTime ngayCapNhat;
}
