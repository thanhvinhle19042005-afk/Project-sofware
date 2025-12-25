package com.quanlytodanpho.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TaiLieuRequest {
    @NotBlank(message = "Tên tài liệu không được để trống")
    private String tenTaiLieu;

    @NotBlank(message = "Loại tài liệu không được để trống")
    private String loaiTaiLieu; // DOCUMENT, IMAGE, OTHER

    @NotBlank(message = "Đường dẫn file không được để trống")
    private String duongDanFile;

    private String moTa;
}
