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
@Table(name = "GiaDinh")
@EntityListeners(AuditingEntityListener.class)
public class GiaDinh {
    
    @Id
    @Column(name = "MaGiaDinh", length = 20)
    private String maGiaDinh;
    
    @Column(name = "CCCD_ChuHo", length = 12)
    private String cccdChuHo;
    
    @Column(name = "SoThanhVien")
    private Integer soThanhVien = 0;
    
    @Column(name = "MaBDS", length = 20)
    private String maBDS;
    
    @CreatedDate
    @Column(name = "NgayTao", nullable = false, updatable = false)
    private LocalDateTime ngayTao;
    
    @LastModifiedDate
    @Column(name = "NgayCapNhat")
    private LocalDateTime ngayCapNhat;
}
