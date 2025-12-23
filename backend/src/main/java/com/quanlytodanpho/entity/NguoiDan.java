package com.quanlytodanpho.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "NguoiDan")
@EntityListeners(AuditingEntityListener.class)
public class NguoiDan {
    
    @Id
    @Column(name = "CCCD", length = 12)
    private String cccd;
    
    @Column(name = "HoTen", length = 100, nullable = false)
    private String hoTen;
    
    @Column(name = "NgaySinh", nullable = false)
    private LocalDate ngaySinh;
    
    @Column(name = "GioiTinh", length = 10, nullable = false)
    private String gioiTinh;
    
    @Column(name = "MaGiaDinh", length = 20)
    private String maGiaDinh;
    
    @Column(name = "TamChu")
    private Boolean tamChu = false;
    
    @Column(name = "SoDienThoai", length = 15)
    private String soDienThoai;
    
    @Column(name = "Email", length = 100)
    private String email;
    
    @CreatedDate
    @Column(name = "NgayTao", nullable = false, updatable = false)
    private LocalDateTime ngayTao;
    
    @LastModifiedDate
    @Column(name = "NgayCapNhat")
    private LocalDateTime ngayCapNhat;
}
