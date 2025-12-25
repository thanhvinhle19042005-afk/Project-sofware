package com.quanlytodanpho.controller;

import com.quanlytodanpho.dto.ApiResponse;
import com.quanlytodanpho.entity.NguoiDan;
import com.quanlytodanpho.exception.ResourceNotFoundException;
import com.quanlytodanpho.repository.GiaDinhRepository;
import com.quanlytodanpho.repository.NguoiDanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/nguoi-dan")
@RequiredArgsConstructor
public class NguoiDanController {

    private final NguoiDanRepository nguoiDanRepository;
    private final GiaDinhRepository giaDinhRepository;
    private final com.quanlytodanpho.service.ThongBaoService thongBaoService;

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

        // Kiểm tra gia đình có tồn tại không (nếu có maGiaDinh)
        if (nguoiDanDetails.getMaGiaDinh() != null && 
            !giaDinhRepository.existsById(nguoiDanDetails.getMaGiaDinh())) {
            throw new ResourceNotFoundException("GiaDinh", "maGiaDinh", nguoiDanDetails.getMaGiaDinh());
        }

        nguoiDan.setHoTen(nguoiDanDetails.getHoTen());
        nguoiDan.setNgaySinh(nguoiDanDetails.getNgaySinh());
        nguoiDan.setGioiTinh(nguoiDanDetails.getGioiTinh());
        nguoiDan.setSoDienThoai(nguoiDanDetails.getSoDienThoai());
        nguoiDan.setEmail(nguoiDanDetails.getEmail());
        nguoiDan.setMaGiaDinh(nguoiDanDetails.getMaGiaDinh());
        nguoiDan.setTamChu(nguoiDanDetails.getTamChu());
        nguoiDan.setNgayCapNhat(LocalDateTime.now());

        NguoiDan updatedNguoiDan = nguoiDanRepository.save(nguoiDan);

        // Update member counts
        String newMaGiaDinh = updatedNguoiDan.getMaGiaDinh();
        if (oldMaGiaDinh != null && !oldMaGiaDinh.equals(newMaGiaDinh)) {
            updateGiaDinhCount(oldMaGiaDinh);
        }
        if (newMaGiaDinh != null && !newMaGiaDinh.equals(oldMaGiaDinh)) {
            updateGiaDinhCount(newMaGiaDinh);
        }

        // Send notification
        try {
            thongBaoService.createNotification(
                "Cập nhật thông tin cá nhân",
                "Thông tin cá nhân của bạn (CCCD: " + cccd + ") đã được cập nhật bởi quản trị viên.",
                null,
                "Bình thường"
            );
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
