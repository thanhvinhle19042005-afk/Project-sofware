package com.quanlytodanpho.service;

import com.quanlytodanpho.constant.NotificationConstants;
import com.quanlytodanpho.dto.DangKySuKienDTO;
import com.quanlytodanpho.entity.DangKySuKien;
import com.quanlytodanpho.entity.NguoiDan;
import com.quanlytodanpho.entity.SuKien;
import com.quanlytodanpho.entity.TaiKhoan;
import com.quanlytodanpho.repository.DangKySuKienRepository;
import com.quanlytodanpho.repository.NguoiDanRepository;
import com.quanlytodanpho.repository.SuKienRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DangKySuKienService {
    
    private final DangKySuKienRepository dangKySuKienRepository;
    private final SuKienRepository suKienRepository;
    private final NguoiDanRepository nguoiDanRepository;
    private final AuthService authService;
    private final ThongBaoService thongBaoService;
    
    @Transactional
    public DangKySuKienDTO registerForEvent(Integer maSuKien, String ghiChu) {
        TaiKhoan currentUser = authService.getCurrentUser();
        String cccd = currentUser.getCccd();
        
        if (cccd == null) {
            throw new RuntimeException("Tài khoản chưa liên kết với người dân");
        }
        
        NguoiDan nguoiDan = nguoiDanRepository.findById(cccd)
                .orElseThrow(() -> new RuntimeException("Người dân không tồn tại"));
        
        SuKien suKien = suKienRepository.findById(maSuKien)
                .orElseThrow(() -> new RuntimeException("Sự kiện không tồn tại"));
        
        // Check if event is approved
        // Allow "Sắp diễn ra" (Upcoming) as well
        String trangThai = suKien.getTrangThai() != null ? suKien.getTrangThai().trim() : "";
        List<String> validStatuses = Arrays.asList("Đã phê duyệt", "Đang diễn ra", "Sắp diễn ra");
        
        boolean isValid = validStatuses.stream()
                .anyMatch(s -> s.equalsIgnoreCase(trangThai));

        if (!isValid) {
            throw new RuntimeException("Sự kiện chưa được phê duyệt (Trạng thái hiện tại: '" + trangThai + "')");
        }
        
        // Check if already registered
        dangKySuKienRepository.findByMaSuKienAndCccdNguoiDangKy(maSuKien, cccd)
                .ifPresent(existing -> {
                    if (!existing.getTrangThai().equals("Hủy đăng ký")) {
                        throw new RuntimeException("Bạn đã đăng ký sự kiện này");
                    }
                });
        
        // Check capacity
        if (suKien.getSoLuongToiDa() != null) {
            Long currentCount = dangKySuKienRepository.countActiveRegistrations(maSuKien);
            if (currentCount >= suKien.getSoLuongToiDa()) {
                throw new RuntimeException("Sự kiện đã đủ số lượng người tham gia");
            }
        }
        
        DangKySuKien dangKy = new DangKySuKien();
        dangKy.setMaSuKien(maSuKien);
        dangKy.setCccdNguoiDangKy(cccd);
        dangKy.setMaGiaDinh(nguoiDan.getMaGiaDinh());
        dangKy.setGhiChu(ghiChu);
        dangKy.setThoiGianDangKy(LocalDateTime.now());
        dangKy.setTrangThai("Đã đăng ký");
        
        dangKy = dangKySuKienRepository.save(dangKy);
        return convertToDTO(dangKy);
    }
    
    @Transactional
    public void cancelRegistration(Integer maDangKy) {
        DangKySuKien dangKy = dangKySuKienRepository.findById(maDangKy)
                .orElseThrow(() -> new RuntimeException("Đăng ký không tồn tại"));
        
        TaiKhoan currentUser = authService.getCurrentUser();
        
        // Check if user is owner or admin
        boolean isOwner = dangKy.getCccdNguoiDangKy().equals(currentUser.getCccd());
        boolean isAdmin = false;
        
        try {
            // Simple check for admin role based on current implementation
            // In a real app, we might check authorities
            if (currentUser.getMaVaiTro() != null) {
                // Assuming role ID 1 is Admin or checking role name via repository
                // For now, let's assume if they can access the admin endpoint, they are admin
                // But here we are in service layer.
                // Let's check if the user has admin role
                // This is a bit hacky without role repository access here or proper security context check
                // Better to rely on PreAuthorize in controller for Admin actions
                // But for mixed use (user cancels own, admin cancels any), we need logic here.
                
                // Let's assume we can check role name from DB or context
                // For simplicity, if not owner, we check if they are admin
                // If we can't easily check admin here, we might need to pass a flag or separate method
                
                // Let's use a separate method for Admin cancellation or update this one
                // to allow if user has ROLE_ADMIN authority
                
                // Check authorities from SecurityContext
                var authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
                if (authentication != null && authentication.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("Admin"))) {
                    isAdmin = true;
                }
            }
        } catch (Exception e) {
            // Ignore
        }
        
        if (!isOwner && !isAdmin) {
            throw new RuntimeException("Bạn không có quyền hủy đăng ký này");
        }
        
        dangKy.setTrangThai("Hủy đăng ký");
        dangKySuKienRepository.save(dangKy);
        
        // Notify if admin removed user
        if (isAdmin && !isOwner) {
            try {
                suKienRepository.findById(dangKy.getMaSuKien()).ifPresent(suKien -> {
                    thongBaoService.createPersonalNotification(
                        NotificationConstants.TITLE_EVENT_REGISTRATION_CANCELLED,
                        String.format(NotificationConstants.CONTENT_EVENT_REGISTRATION_CANCELLED, suKien.getTenSuKien()),
                        dangKy.getCccdNguoiDangKy(),
                        NotificationConstants.URGENCY_NORMAL
                    );
                });
            } catch (Exception e) {
                System.err.println("Failed to send notification: " + e.getMessage());
            }
        }
    }

    @Transactional
    public DangKySuKienDTO adminRegisterUser(Integer maSuKien, String cccd) {
        // Verify event exists
        SuKien suKien = suKienRepository.findById(maSuKien)
                .orElseThrow(() -> new RuntimeException("Sự kiện không tồn tại"));
                
        // Verify user exists
        NguoiDan nguoiDan = nguoiDanRepository.findById(cccd)
                .orElseThrow(() -> new RuntimeException("Người dân không tồn tại (CCCD: " + cccd + ")"));
                
        // Check if already registered
        dangKySuKienRepository.findByMaSuKienAndCccdNguoiDangKy(maSuKien, cccd)
                .ifPresent(existing -> {
                    if (!existing.getTrangThai().equals("Hủy đăng ký")) {
                        throw new RuntimeException("Người dân này đã đăng ký sự kiện");
                    }
                });
                
        DangKySuKien dangKy = new DangKySuKien();
        dangKy.setMaSuKien(maSuKien);
        dangKy.setCccdNguoiDangKy(cccd);
        dangKy.setMaGiaDinh(nguoiDan.getMaGiaDinh());
        dangKy.setThoiGianDangKy(LocalDateTime.now());
        dangKy.setTrangThai("Đã đăng ký");
        dangKy.setGhiChu("Đăng ký bởi Admin");
        
        dangKy = dangKySuKienRepository.save(dangKy);
        return convertToDTO(dangKy);
    }
    
    @Transactional(readOnly = true)
    public List<DangKySuKienDTO> getMyRegistrations() {
        TaiKhoan currentUser = authService.getCurrentUser();
        String cccd = currentUser.getCccd();
        
        if (cccd == null) {
            throw new RuntimeException("Tài khoản chưa liên kết với người dân");
        }
        
        return dangKySuKienRepository.findByCccdNguoiDangKy(cccd).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<DangKySuKienDTO> getRegistrationsByEvent(Integer maSuKien) {
        return dangKySuKienRepository.findByMaSuKien(maSuKien).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    private DangKySuKienDTO convertToDTO(DangKySuKien dangKy) {
        DangKySuKienDTO dto = new DangKySuKienDTO();
        dto.setMaDangKy(dangKy.getMaDangKy());
        dto.setMaSuKien(dangKy.getMaSuKien());
        dto.setCccdNguoiDangKy(dangKy.getCccdNguoiDangKy());
        dto.setMaGiaDinh(dangKy.getMaGiaDinh());
        dto.setThoiGianDangKy(dangKy.getThoiGianDangKy());
        dto.setTrangThai(dangKy.getTrangThai());
        dto.setGhiChu(dangKy.getGhiChu());
        
        // Get event name
        suKienRepository.findById(dangKy.getMaSuKien()).ifPresent(suKien -> {
            dto.setTenSuKien(suKien.getTenSuKien());
        });
        
        // Get participant name
        nguoiDanRepository.findById(dangKy.getCccdNguoiDangKy()).ifPresent(nguoiDan -> {
            dto.setHoTenNguoiDangKy(nguoiDan.getHoTen());
        });
        
        return dto;
    }
}
