package com.quanlytodanpho.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DangKySuKienDTO {
    private Integer maDangKy;
    private Integer maSuKien;
    private String tenSuKien;
    private String cccdNguoiDangKy;
    private String hoTenNguoiDangKy;
    private String maGiaDinh;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime thoiGianDangKy;
    
    private String trangThai;
    private String ghiChu;
}
