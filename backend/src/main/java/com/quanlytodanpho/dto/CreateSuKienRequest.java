package com.quanlytodanpho.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateSuKienRequest {
    
    @NotBlank(message = "Tên sự kiện không được để trống")
    private String tenSuKien;
    
    private String moTa;
    private String noiDung;
    
    @NotNull(message = "Thời gian bắt đầu không được để trống")
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    private LocalDateTime thoiGianBatDau;
    
    @NotNull(message = "Thời gian kết thúc không được để trống")
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    private LocalDateTime thoiGianKetThuc;
    
    private String diaDiem;
    private String loaiSuKien = "Họp tổ dân phố";
    private Integer soLuongToiDa;
}
