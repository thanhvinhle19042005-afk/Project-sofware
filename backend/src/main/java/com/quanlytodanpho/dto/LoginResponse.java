package com.quanlytodanpho.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String type = "Bearer";
    private Integer maTaiKhoan;
    private String tenDangNhap;
    private String cccd;
    private String vaiTro;
    private String hoTen;
    private String maGiaDinh;
    
    public LoginResponse(String token, Integer maTaiKhoan, String tenDangNhap, 
                        String cccd, String vaiTro, String hoTen) {
        this.token = token;
        this.maTaiKhoan = maTaiKhoan;
        this.tenDangNhap = tenDangNhap;
        this.cccd = cccd;
        this.vaiTro = vaiTro;
        this.hoTen = hoTen;
    }
}
