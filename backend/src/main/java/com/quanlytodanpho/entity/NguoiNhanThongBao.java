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
@Table(name = "NguoiNhanThongBao")
public class NguoiNhanThongBao {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaNhanThongBao")
    private Integer maNhanThongBao;
    
    @Column(name = "MaThongBao", nullable = false)
    private Integer maThongBao;
    
    @Column(name = "CCCD_NguoiNhan", length = 12, nullable = false)
    private String cccdNguoiNhan;
    
    @Column(name = "DaDoc")
    private Boolean daDoc = false;
    
    @Column(name = "ThoiGianDoc")
    private LocalDateTime thoiGianDoc;
    
    @Column(name = "DaGuiEmail")
    private Boolean daGuiEmail = false;
    
    @Column(name = "ThoiGianGuiEmail")
    private LocalDateTime thoiGianGuiEmail;
    
    @Column(name = "EmailStatus", length = 50)
    private String emailStatus;
}
