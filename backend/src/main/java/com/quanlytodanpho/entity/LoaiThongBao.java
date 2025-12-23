package com.quanlytodanpho.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "LoaiThongBao")
public class LoaiThongBao {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaLoai")
    private Integer maLoai;
    
    @Column(name = "TenLoai", length = 50, nullable = false, unique = true)
    private String tenLoai;
    
    @Column(name = "MoTa", length = 200)
    private String moTa;
}
