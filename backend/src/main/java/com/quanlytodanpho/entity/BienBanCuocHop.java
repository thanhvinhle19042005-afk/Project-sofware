package com.quanlytodanpho.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "BienBanCuocHop")
@EntityListeners(AuditingEntityListener.class)
public class BienBanCuocHop {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaBienBan")
    private Integer maBienBan;
    
    @Column(name = "MaSuKien", nullable = false, unique = true)
    private Integer maSuKien;
    
    @Column(name = "TieuDe", length = 200, nullable = false)
    private String tieuDe;
    
    @Column(name = "NoiDungBienBan", columnDefinition = "TEXT", nullable = false)
    private String noiDungBienBan;
    
    @Column(name = "KetLuan", columnDefinition = "TEXT")
    private String ketLuan;
    
    @Column(name = "SoNguoiThamGia")
    private Integer soNguoiThamGia = 0;
    
    @Column(name = "SoHoThamGia")
    private Integer soHoThamGia = 0;
    
    @Column(name = "NguoiLapID", length = 12)
    private String nguoiLapId;
    
    @Column(name = "NgayLap")
    private LocalDateTime ngayLap = LocalDateTime.now();
    
    @Column(name = "TrangThai", length = 30)
    private String trangThai = "Nháp";
    
    @LastModifiedDate
    @Column(name = "NgayCapNhat")
    private LocalDateTime ngayCapNhat;
}
