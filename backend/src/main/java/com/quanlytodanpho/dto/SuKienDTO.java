package com.quanlytodanpho.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SuKienDTO {
    private Integer maSuKien;
    private String tenSuKien;
    private String moTa;
    private String noiDung;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime thoiGianBatDau;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime thoiGianKetThuc;
    
    private String diaDiem;
    private String loaiSuKien;
    private Integer soLuongToiDa;
    private String trangThai;
    private String nguoiTaoId;
    private String tenNguoiTao;
    private Long soNguoiDangKy;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime ngayTao;
}
