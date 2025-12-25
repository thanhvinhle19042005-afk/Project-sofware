package com.quanlytodanpho.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "VaiTro")
public class VaiTro {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaVaiTro")
    private Integer maVaiTro;
    
    @Column(name = "TenVaiTro", length = 50, nullable = false, unique = true)
    private String tenVaiTro;
    
    @Column(name = "MoTa", length = 200)
    private String moTa;
}
