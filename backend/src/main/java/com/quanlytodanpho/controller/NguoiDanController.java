package com.quanlytodanpho.controller;

import com.quanlytodanpho.constant.NotificationConstants;
import com.quanlytodanpho.dto.ApiResponse;
import com.quanlytodanpho.entity.GiaDinh;
import com.quanlytodanpho.entity.NguoiDan;
import com.quanlytodanpho.entity.TaiKhoan;
import com.quanlytodanpho.exception.ResourceNotFoundException;
import com.quanlytodanpho.repository.GiaDinhRepository;
import com.quanlytodanpho.repository.NguoiDanRepository;
import com.quanlytodanpho.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/nguoi-dan")
@RequiredArgsConstructor
public class NguoiDanController {

    private final NguoiDanRepository nguoiDanRepository;
    private final GiaDinhRepository giaDinhRepository;
    private final com.quanlytodanpho.service.ThongBaoService thongBaoService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NguoiDan>>> getAllNguoiDan() {
        List<NguoiDan> nguoiDans = nguoiDanRepository.findAll();
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách người dân thành công", nguoiDans));
    }

    @GetMapping("/{cccd}")
    public ResponseEntity<ApiResponse<NguoiDan>> getNguoiDanByCccd(@PathVariable String cccd) {
        NguoiDan nguoiDan = nguoiDanRepository.findById(cccd)
                .orElseThrow(() -> new ResourceNotFoundException("NguoiDan", "cccd", cccd));
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy thông tin người dân thành công", nguoiDan));
    }

    @GetMapping("/gia-dinh/{maGiaDinh}")
    public ResponseEntity<ApiResponse<List<NguoiDan>>> getNguoiDanByGiaDinh(@PathVariable String maGiaDinh) {
        List<NguoiDan> nguoiDans = nguoiDanRepository.findByMaGiaDinh(maGiaDinh);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách thành viên gia đình thành công", nguoiDans));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<NguoiDan>> createNguoiDan(@RequestBody NguoiDan nguoiDan) {
        // Kiểm tra CCCD đã tồn tại chưa
        if (nguoiDanRepository.existsById(nguoiDan.getCccd())) {
            throw new IllegalArgumentException("CCCD đã tồn tại trong hệ thống");
        }
        
        // Kiểm tra gia đình có tồn tại không (nếu có maGiaDinh)
        if (nguoiDan.getMaGiaDinh() != null && !giaDinhRepository.existsById(nguoiDan.getMaGiaDinh())) {
            throw new ResourceNotFoundException("GiaDinh", "maGiaDinh", nguoiDan.getMaGiaDinh());
        }
        
        nguoiDan.setNgayTao(LocalDateTime.now());
        NguoiDan savedNguoiDan = nguoiDanRepository.save(nguoiDan);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Tạo người dân thành công", savedNguoiDan));
    }

    @PutMapping("/{cccd}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER')")
    public ResponseEntity<ApiResponse<NguoiDan>> updateNguoiDan(
            @PathVariable String cccd,
            @RequestBody NguoiDan nguoiDanDetails) {
        NguoiDan nguoiDan = nguoiDanRepository.findById(cccd)
                .orElseThrow(() -> new ResourceNotFoundException("NguoiDan", "cccd", cccd));

        String oldMaGiaDinh = nguoiDan.getMaGiaDinh();
        String newMaGiaDinh = nguoiDanDetails.getMaGiaDinh();

        // Permission Check
        TaiKhoan currentUser = authService.getCurrentUser();
        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ADMIN"));
        
        if (!isAdmin) {
            // If updating own profile
            if (currentUser.getCccd().equals(cccd)) {
                // Prevent changing family ID (leaving/joining) by self
                if (!Objects.equals(oldMaGiaDinh, newMaGiaDinh)) {
                    throw new AccessDeniedException("Bạn không có quyền tự thay đổi hộ gia đình. Vui lòng liên hệ chủ hộ.");
                }
            } else {
                // If updating someone else (Adding/Removing member)
                boolean isAuthorized = false;
                
                // Check if current user is Head of the NEW family (Adding member)
                if (newMaGiaDinh != null) {
                    GiaDinh family = giaDinhRepository.findById(newMaGiaDinh).orElse(null);
                    if (family != null && currentUser.getCccd().equals(family.getCccdChuHo())) {
                        isAuthorized = true;
                    }
                }
                
                // Check if current user is Head of the OLD family (Removing member)
                if (oldMaGiaDinh != null) {
                    GiaDinh family = giaDinhRepository.findById(oldMaGiaDinh).orElse(null);
                    if (family != null && currentUser.getCccd().equals(family.getCccdChuHo())) {
                        isAuthorized = true;
                    }
                }
                
                if (!isAuthorized) {
                    throw new AccessDeniedException("Bạn không có quyền thực hiện thao tác này trên cư dân khác");
                }
            }
        }

        // Kiểm tra gia đình có tồn tại không (nếu có maGiaDinh)
        if (newMaGiaDinh != null && 
            !giaDinhRepository.existsById(newMaGiaDinh)) {
            throw new ResourceNotFoundException("GiaDinh", "maGiaDinh", newMaGiaDinh);
        }

        // Track changes
        List<String> changes = new java.util.ArrayList<>();
        if (!Objects.equals(nguoiDan.getHoTen(), nguoiDanDetails.getHoTen())) changes.add("Họ tên");
        if (!Objects.equals(nguoiDan.getNgaySinh(), nguoiDanDetails.getNgaySinh())) changes.add("Ngày sinh");
        if (!Objects.equals(nguoiDan.getGioiTinh(), nguoiDanDetails.getGioiTinh())) changes.add("Giới tính");
        if (!Objects.equals(nguoiDan.getSoDienThoai(), nguoiDanDetails.getSoDienThoai())) changes.add("Số điện thoại");
        if (!Objects.equals(nguoiDan.getEmail(), nguoiDanDetails.getEmail())) changes.add("Email");
        if (!Objects.equals(nguoiDan.getTamChu(), nguoiDanDetails.getTamChu())) changes.add("Tạm trú");
        if (!Objects.equals(nguoiDan.getMaGiaDinh(), newMaGiaDinh)) changes.add("Hộ gia đình");

        nguoiDan.setHoTen(nguoiDanDetails.getHoTen());
        nguoiDan.setNgaySinh(nguoiDanDetails.getNgaySinh());
        nguoiDan.setGioiTinh(nguoiDanDetails.getGioiTinh());
        nguoiDan.setSoDienThoai(nguoiDanDetails.getSoDienThoai());
        nguoiDan.setEmail(nguoiDanDetails.getEmail());
        nguoiDan.setMaGiaDinh(newMaGiaDinh);
        nguoiDan.setTamChu(nguoiDanDetails.getTamChu());
        nguoiDan.setNgayCapNhat(LocalDateTime.now());

        NguoiDan updatedNguoiDan = nguoiDanRepository.save(nguoiDan);

        // Update member counts
        if (oldMaGiaDinh != null && !oldMaGiaDinh.equals(newMaGiaDinh)) {
            updateGiaDinhCount(oldMaGiaDinh);
        }
        if (newMaGiaDinh != null && !newMaGiaDinh.equals(oldMaGiaDinh)) {
            updateGiaDinhCount(newMaGiaDinh);
        }

        // Send notification
        try {
            if (!changes.isEmpty()) {
                String changesStr = String.join(", ", changes);
                thongBaoService.createPersonalNotification(
                    NotificationConstants.TITLE_PERSONAL_INFO_UPDATED,
                    String.format(NotificationConstants.CONTENT_PERSONAL_INFO_UPDATED, cccd, changesStr),
                    cccd,
                    NotificationConstants.URGENCY_NORMAL
                );
            }
            
            // Check if added to family
            if (newMaGiaDinh != null && !newMaGiaDinh.equals(oldMaGiaDinh)) {
                 thongBaoService.createPersonalNotification(
                    NotificationConstants.TITLE_ADDED_TO_FAMILY,
                    String.format(NotificationConstants.CONTENT_ADDED_TO_FAMILY, newMaGiaDinh),
                    cccd,
                    NotificationConstants.URGENCY_NORMAL
                );
            }
            
            // Check if removed from family
            if (oldMaGiaDinh != null && !oldMaGiaDinh.equals(newMaGiaDinh)) {
                 thongBaoService.createPersonalNotification(
                    NotificationConstants.TITLE_REMOVED_FROM_FAMILY,
                    String.format(NotificationConstants.CONTENT_REMOVED_FROM_FAMILY, oldMaGiaDinh),
                    cccd,
                    NotificationConstants.URGENCY_NORMAL
                );
            }
        } catch (Exception e) {
            // Log error but don't fail the request
            System.err.println("Failed to send notification: " + e.getMessage());
        }

        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật người dân thành công", updatedNguoiDan));
    }

    private void updateGiaDinhCount(String maGiaDinh) {
        giaDinhRepository.findById(maGiaDinh).ifPresent(giaDinh -> {
            long count = nguoiDanRepository.countByMaGiaDinh(maGiaDinh);
            giaDinh.setSoThanhVien((int) count);
            giaDinhRepository.save(giaDinh);
        });
    }

    @DeleteMapping("/{cccd}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteNguoiDan(@PathVariable String cccd) {
        NguoiDan nguoiDan = nguoiDanRepository.findById(cccd)
                .orElseThrow(() -> new ResourceNotFoundException("NguoiDan", "cccd", cccd));
        
        String maGiaDinh = nguoiDan.getMaGiaDinh();
        nguoiDanRepository.delete(nguoiDan);
        
        if (maGiaDinh != null) {
            updateGiaDinhCount(maGiaDinh);
        }

        return ResponseEntity.ok(new ApiResponse<>(true, "Xóa người dân thành công", null));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<NguoiDan>>> searchNguoiDan(@RequestParam String keyword) {
        List<NguoiDan> nguoiDans = nguoiDanRepository.searchByHoTenOrCccd(keyword);
        return ResponseEntity.ok(new ApiResponse<>(true, "Tìm kiếm người dân thành công", nguoiDans));
    }
}
