package com.quanlytodanpho.service;

import com.quanlytodanpho.dto.CreateSuKienRequest;
import com.quanlytodanpho.dto.SuKienDTO;
import com.quanlytodanpho.entity.NguoiDan;
import com.quanlytodanpho.entity.SuKien;
import com.quanlytodanpho.entity.TaiKhoan;
import com.quanlytodanpho.entity.VaiTro;
import com.quanlytodanpho.repository.DangKySuKienRepository;
import com.quanlytodanpho.repository.NguoiDanRepository;
import com.quanlytodanpho.repository.SuKienRepository;
import com.quanlytodanpho.repository.VaiTroRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SuKienService {
    
    private final SuKienRepository suKienRepository;
    private final DangKySuKienRepository dangKySuKienRepository;
    private final NguoiDanRepository nguoiDanRepository;
    private final VaiTroRepository vaiTroRepository;
    private final AuthService authService;
    private final ModelMapper modelMapper;
    private final NotificationAutoService notificationAutoService;
    
    @Transactional
    public SuKienDTO createSuKien(CreateSuKienRequest request) {
        if (request.getThoiGianKetThuc().isBefore(request.getThoiGianBatDau())) {
            throw new RuntimeException("Thời gian kết thúc phải sau thời gian bắt đầu");
        }
        
        TaiKhoan currentUser = authService.getCurrentUser();
        
        SuKien suKien = new SuKien();
        suKien.setTenSuKien(request.getTenSuKien());
        suKien.setMoTa(request.getMoTa());
        suKien.setNoiDung(request.getNoiDung());
        suKien.setThoiGianBatDau(request.getThoiGianBatDau());
        suKien.setThoiGianKetThuc(request.getThoiGianKetThuc());
        suKien.setDiaDiem(request.getDiaDiem());
        suKien.setLoaiSuKien(request.getLoaiSuKien());
        suKien.setSoLuongToiDa(request.getSoLuongToiDa());
        suKien.setNguoiTaoId(currentUser.getCccd());
        
        // Check role to set status
        VaiTro vaiTro = vaiTroRepository.findById(currentUser.getMaVaiTro())
                .orElseThrow(() -> new RuntimeException("Vai trò không tồn tại"));
                
        if ("Admin".equalsIgnoreCase(vaiTro.getTenVaiTro())) {
            suKien.setTrangThai("Đã phê duyệt");
        } else {
            suKien.setTrangThai("Chờ phê duyệt");
        }
        
        suKien = suKienRepository.save(suKien);
        
        // Gửi thông báo tự động
        notificationAutoService.sendEventCreatedNotification(suKien);
        
        return convertToDTO(suKien);
    }
    
    @Transactional
    public SuKienDTO updateSuKien(Integer maSuKien, CreateSuKienRequest request) {
        SuKien suKien = suKienRepository.findById(maSuKien)
                .orElseThrow(() -> new RuntimeException("Sự kiện không tồn tại"));
        
        if (request.getThoiGianKetThuc().isBefore(request.getThoiGianBatDau())) {
            throw new RuntimeException("Thời gian kết thúc phải sau thời gian bắt đầu");
        }
        
        suKien.setTenSuKien(request.getTenSuKien());
        suKien.setMoTa(request.getMoTa());
        suKien.setNoiDung(request.getNoiDung());
        suKien.setThoiGianBatDau(request.getThoiGianBatDau());
        suKien.setThoiGianKetThuc(request.getThoiGianKetThuc());
        suKien.setDiaDiem(request.getDiaDiem());
        suKien.setLoaiSuKien(request.getLoaiSuKien());
        suKien.setSoLuongToiDa(request.getSoLuongToiDa());
        
        suKien = suKienRepository.save(suKien);
        return convertToDTO(suKien);
    }
    
    @Transactional
    public void approveSuKien(Integer maSuKien) {
        SuKien suKien = suKienRepository.findById(maSuKien)
                .orElseThrow(() -> new RuntimeException("Sự kiện không tồn tại"));
        suKien.setTrangThai("Đã phê duyệt");
        suKienRepository.save(suKien);
    }
    
    @Transactional
    public void rejectSuKien(Integer maSuKien) {
        SuKien suKien = suKienRepository.findById(maSuKien)
                .orElseThrow(() -> new RuntimeException("Sự kiện không tồn tại"));
        suKien.setTrangThai("Hủy bỏ");
        suKienRepository.save(suKien);
    }
    
    @Transactional(readOnly = true)
    public List<SuKienDTO> getAllSuKien() {
        return suKienRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<SuKienDTO> getUpcomingSuKien() {
        List<String> activeStatuses = Arrays.asList("Đã phê duyệt", "Đang diễn ra");
        return suKienRepository.findActiveEvents(activeStatuses, LocalDateTime.now()).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public SuKienDTO getSuKienById(Integer maSuKien) {
        SuKien suKien = suKienRepository.findById(maSuKien)
                .orElseThrow(() -> new RuntimeException("Sự kiện không tồn tại"));
        return convertToDTO(suKien);
    }
    
    @Transactional
    public void deleteSuKien(Integer maSuKien) {
        if (!suKienRepository.existsById(maSuKien)) {
            throw new RuntimeException("Sự kiện không tồn tại");
        }
        suKienRepository.deleteById(maSuKien);
    }
    
    private SuKienDTO convertToDTO(SuKien suKien) {
        SuKienDTO dto = modelMapper.map(suKien, SuKienDTO.class);
        
        // Get creator name
        if (suKien.getNguoiTaoId() != null) {
            nguoiDanRepository.findById(suKien.getNguoiTaoId()).ifPresent(nguoiDan -> {
                dto.setTenNguoiTao(nguoiDan.getHoTen());
            });
        }
        
        // Get registration count
        Long registrationCount = dangKySuKienRepository.countActiveRegistrations(suKien.getMaSuKien());
        dto.setSoNguoiDangKy(registrationCount);
        
        return dto;
    }
}
