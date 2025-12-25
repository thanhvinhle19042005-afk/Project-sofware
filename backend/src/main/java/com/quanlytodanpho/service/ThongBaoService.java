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
    private final TaiKhoanRepository taiKhoanRepository;
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
        
        // No need to create NguoiNhanThongBao for everyone anymore.
        // We will use a "Pull" model where users fetch all notifications
        // and we only track "Read" status in NguoiNhanThongBao.
        
        return convertToDTO(thongBao, null);
    }
    
    @Transactional(readOnly = true)
    public List<ThongBaoDTO> getMyNotifications() {
        TaiKhoan currentUser = authService.getCurrentUser();
        String cccd = currentUser.getCccd();
        
        if (cccd == null) {
            return List.of();
        }
        
        // 1. Get all notifications (Broadcast model)
        List<ThongBao> allThongBaos = thongBaoRepository.findAll();
        
        // 2. Get read status for current user
        List<NguoiNhanThongBao> myReadStatus = nguoiNhanThongBaoRepository.findByCccdNguoiNhan(cccd);
        
        // 3. Map to DTO
        return allThongBaos.stream()
                .map(thongBao -> {
                    // Find if user has read this notification
                    NguoiNhanThongBao status = myReadStatus.stream()
                            .filter(n -> n.getMaThongBao().equals(thongBao.getMaThongBao()))
                            .findFirst()
                            .orElse(null);
                            
                    return convertToDTO(thongBao, status);
                })
                .sorted((a, b) -> b.getThoiGianGui().compareTo(a.getThoiGianGui()))
                .collect(Collectors.toList());
    }
    
    @Transactional
    public void markAsRead(Integer maThongBao) {
        TaiKhoan currentUser = authService.getCurrentUser();
        String cccd = currentUser.getCccd();
        
        if (cccd == null) {
            throw new RuntimeException("Tài khoản chưa liên kết với người dân");
        }
        
        // Check if already marked as read
        List<NguoiNhanThongBao> existing = nguoiNhanThongBaoRepository.findByMaThongBao(maThongBao);
        boolean alreadyRead = existing.stream()
                .anyMatch(n -> n.getCccdNguoiNhan().equals(cccd) && Boolean.TRUE.equals(n.getDaDoc()));
                
        if (alreadyRead) {
            return;
        }
        
        // Create or update read status
        NguoiNhanThongBao nguoiNhan = existing.stream()
                .filter(n -> n.getCccdNguoiNhan().equals(cccd))
                .findFirst()
                .orElse(new NguoiNhanThongBao());
                
        if (nguoiNhan.getMaNhanThongBao() == null) {
            nguoiNhan.setMaThongBao(maThongBao);
            nguoiNhan.setCccdNguoiNhan(cccd);
        }
        
        nguoiNhan.setDaDoc(true);
        nguoiNhan.setThoiGianDoc(LocalDateTime.now());
        nguoiNhanThongBaoRepository.save(nguoiNhan);
    }

    @Transactional(readOnly = true)
    public List<ThongBaoDTO> getSentNotifications() {
        TaiKhoan currentUser = authService.getCurrentUser();
        List<ThongBao> sentNotifications = thongBaoRepository.findByNguoiGuiId(currentUser.getMaTaiKhoan());
        return sentNotifications.stream()
                .map(tb -> convertToDTO(tb, null))
                .collect(Collectors.toList());
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
