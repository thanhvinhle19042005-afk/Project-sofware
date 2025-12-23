package com.quanlytodanpho.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BienBanRequest {
    @NotBlank(message = "Nội dung không được để trống")
    private String noiDung;

    @NotBlank(message = "Kết luận không được để trống")
    private String ketLuan;

    @NotBlank(message = "Người ghi nhận không được để trống")
    private String nguoiGhiNhan;

    private String ghiChu;
}
