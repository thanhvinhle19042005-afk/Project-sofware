package com.quanlytodanpho.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ThongBaoDTO {
    private Integer maThongBao;
    private String tieuDe;
    private String noiDung;
    private String loaiThongBao;
    private Integer maSuKien;
    private String tenSuKien;
    private String doKhan;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime thoiGianGui;
    
    private String trangThai;
    private Boolean daDoc;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime thoiGianDoc;
}
