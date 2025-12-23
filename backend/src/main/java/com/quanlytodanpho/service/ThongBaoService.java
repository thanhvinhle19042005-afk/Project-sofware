package com.quanlytodanpho.service;

import com.quanlytodanpho.dto.ThongBaoDTO;
import com.quanlytodanpho.entity.*;
import com.quanlytodanpho.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ThongBaoService {
    
    private final ThongBaoRepository thongBaoRepository;
    private final NguoiNhanThongBaoRepository nguoiNhanThongBaoRepository;
    private final GiaDinhRepository giaDinhRepository;
    private final SuKienRepository suKienRepository;
    private final LoaiThongBaoRepository loaiThongBaoRepository;
    private final AuthService authService;
    
    @Transactional
    public ThongBaoDTO createNotification(String tieuDe, String noiDung, Integer maSuKien, String doKhan) {
        TaiKhoan currentUser = authService.getCurrentUser();
        
        LoaiThongBao loaiThongBao = loaiThongBaoRepository.findByTenLoai("Passive")
                .orElseThrow(() -> new RuntimeException("Loại thông báo không tồn tại"));
        
        ThongBao thongBao = new ThongBao();
        thongBao.setTieuDe(tieuDe);
        thongBao.setNoiDung(noiDung);
        thongBao.setMaLoai(loaiThongBao.getMaLoai());
        thongBao.setMaSuKien(maSuKien);
        thongBao.setNguoiGuiId(currentUser.getMaTaiKhoan());
        thongBao.setDoKhan(doKhan != null ? doKhan : "Bình thường");
        thongBao.setThoiGianGui(LocalDateTime.now());
        thongBao.setTrangThai("Đã gửi");
        
        thongBao = thongBaoRepository.save(thongBao);
        
        // Send to all household heads
        List<GiaDinh> giaDinhs = giaDinhRepository.findAll();
        for (GiaDinh giaDinh : giaDinhs) {
            if (giaDinh.getCccdChuHo() != null) {
                NguoiNhanThongBao nguoiNhan = new NguoiNhanThongBao();
                nguoiNhan.setMaThongBao(thongBao.getMaThongBao());
                nguoiNhan.setCccdNguoiNhan(giaDinh.getCccdChuHo());
                nguoiNhan.setDaDoc(false);
                nguoiNhanThongBaoRepository.save(nguoiNhan);
            }
        }
        
        return convertToDTO(thongBao, null);
    }
    
    @Transactional(readOnly = true)
    public List<ThongBaoDTO> getMyNotifications() {
        TaiKhoan currentUser = authService.getCurrentUser();
        String cccd = currentUser.getCccd();
        
        if (cccd == null) {
            return List.of();
        }
        
        List<NguoiNhanThongBao> nguoiNhans = nguoiNhanThongBaoRepository.findByCccdNguoiNhan(cccd);
        
        return nguoiNhans.stream()
                .map(nguoiNhan -> {
                    ThongBao thongBao = thongBaoRepository.findById(nguoiNhan.getMaThongBao())
                            .orElse(null);
                    if (thongBao != null) {
                        return convertToDTO(thongBao, nguoiNhan);
                    }
                    return null;
                })
                .filter(dto -> dto != null)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public void markAsRead(Integer maThongBao) {
        TaiKhoan currentUser = authService.getCurrentUser();
        String cccd = currentUser.getCccd();
        
        if (cccd == null) {
            throw new RuntimeException("Tài khoản chưa liên kết với người dân");
        }
        
        List<NguoiNhanThongBao> nguoiNhans = nguoiNhanThongBaoRepository.findByMaThongBao(maThongBao);
        
        nguoiNhans.stream()
                .filter(nn -> nn.getCccdNguoiNhan().equals(cccd))
                .findFirst()
                .ifPresent(nguoiNhan -> {
                    nguoiNhan.setDaDoc(true);
                    nguoiNhan.setThoiGianDoc(LocalDateTime.now());
                    nguoiNhanThongBaoRepository.save(nguoiNhan);
                });
    }
    
    private ThongBaoDTO convertToDTO(ThongBao thongBao, NguoiNhanThongBao nguoiNhan) {
        ThongBaoDTO dto = new ThongBaoDTO();
        dto.setMaThongBao(thongBao.getMaThongBao());
        dto.setTieuDe(thongBao.getTieuDe());
        dto.setNoiDung(thongBao.getNoiDung());
        dto.setDoKhan(thongBao.getDoKhan());
        dto.setThoiGianGui(thongBao.getThoiGianGui());
        dto.setTrangThai(thongBao.getTrangThai());
        
        if (nguoiNhan != null) {
            dto.setDaDoc(nguoiNhan.getDaDoc());
            dto.setThoiGianDoc(nguoiNhan.getThoiGianDoc());
        }
        
        // Get event name
        if (thongBao.getMaSuKien() != null) {
            suKienRepository.findById(thongBao.getMaSuKien()).ifPresent(suKien -> {
                dto.setMaSuKien(suKien.getMaSuKien());
                dto.setTenSuKien(suKien.getTenSuKien());
            });
        }
        
        // Get notification type
        loaiThongBaoRepository.findById(thongBao.getMaLoai()).ifPresent(loai -> {
            dto.setLoaiThongBao(loai.getTenLoai());
        });
        
        return dto;
    }
}
