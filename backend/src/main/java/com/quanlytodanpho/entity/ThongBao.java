package com.quanlytodanpho.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ThongBao")
@EntityListeners(AuditingEntityListener.class)
public class ThongBao {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaThongBao")
    private Integer maThongBao;
    
    @Column(name = "TieuDe", length = 200, nullable = false)
    private String tieuDe;
    
    @Column(name = "NoiDung", columnDefinition = "TEXT", nullable = false)
    private String noiDung;
    
    @Column(name = "MaLoai", nullable = false)
    private Integer maLoai;
    
    @Column(name = "MaSuKien")
    private Integer maSuKien;
    
    @Column(name = "NguoiGuiID")
    private Integer nguoiGuiId;
    
    @Column(name = "DoKhan", length = 20)
    private String doKhan = "Bình thường";
    
    @Column(name = "GuiEmail")
    private Boolean guiEmail = false;
    
    @Column(name = "ThoiGianGui")
    private LocalDateTime thoiGianGui = LocalDateTime.now();
    
    @Column(name = "ThoiGianHetHan")
    private LocalDateTime thoiGianHetHan;
    
    @Column(name = "TrangThai", length = 20)
    private String trangThai = "Đã gửi";
    
    @CreatedDate
    @Column(name = "NgayTao", nullable = false, updatable = false)
    private LocalDateTime ngayTao;
}
