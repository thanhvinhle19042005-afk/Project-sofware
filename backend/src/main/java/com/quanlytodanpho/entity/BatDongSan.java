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
@Table(name = "BatDongSan")
@EntityListeners(AuditingEntityListener.class)
public class BatDongSan {
    
    @Id
    @Column(name = "MaBDS", length = 20)
    private String maBDS;
    
    @Column(name = "DiaChiDiaLy", length = 500, nullable = false)
    private String diaChiDiaLy;
    
    @Column(name = "CCCD_ChuSoHuu", length = 12)
    private String cccdChuSoHuu;
    
    @CreatedDate
    @Column(name = "NgayTao", nullable = false, updatable = false)
    private LocalDateTime ngayTao;
    
    @LastModifiedDate
    @Column(name = "NgayCapNhat")
    private LocalDateTime ngayCapNhat;
}
