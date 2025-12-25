package com.quanlytodanpho.controller;

import com.quanlytodanpho.constant.NotificationConstants;
import com.quanlytodanpho.dto.ApiResponse;
import com.quanlytodanpho.entity.GiaDinh;
import com.quanlytodanpho.entity.NguoiDan;
import com.quanlytodanpho.exception.ResourceNotFoundException;
import com.quanlytodanpho.repository.BatDongSanRepository;
import com.quanlytodanpho.repository.GiaDinhRepository;
import com.quanlytodanpho.repository.NguoiDanRepository;
import com.quanlytodanpho.service.ThongBaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/gia-dinh")
@RequiredArgsConstructor
public class GiaDinhController {

    private final GiaDinhRepository giaDinhRepository;
    private final NguoiDanRepository nguoiDanRepository;
    private final BatDongSanRepository batDongSanRepository;
    private final ThongBaoService thongBaoService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<GiaDinh>>> getAllGiaDinh() {
        List<GiaDinh> giaDinhs = giaDinhRepository.findAll();
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách gia đình thành công", giaDinhs));
    }

    @GetMapping("/{maGiaDinh}")
    public ResponseEntity<ApiResponse<GiaDinh>> getGiaDinhById(@PathVariable String maGiaDinh) {
        GiaDinh giaDinh = giaDinhRepository.findById(maGiaDinh)
                .orElseThrow(() -> new ResourceNotFoundException("GiaDinh", "maGiaDinh", maGiaDinh));
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy thông tin gia đình thành công", giaDinh));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<GiaDinh>> createGiaDinh(@RequestBody GiaDinh giaDinh) {
        // Kiểm tra mã gia đình đã tồn tại chưa
        if (giaDinhRepository.existsById(giaDinh.getMaGiaDinh())) {
            throw new IllegalArgumentException("Mã gia đình đã tồn tại trong hệ thống");
        }
        
        // Kiểm tra chủ hộ có tồn tại không (nếu có)
        if (giaDinh.getCccdChuHo() != null && !nguoiDanRepository.existsById(giaDinh.getCccdChuHo())) {
            throw new ResourceNotFoundException("NguoiDan", "cccd", giaDinh.getCccdChuHo());
        }
        
        // Kiểm tra bất động sản có tồn tại không (nếu có)
        if (giaDinh.getMaBDS() != null && !batDongSanRepository.existsById(giaDinh.getMaBDS())) {
            throw new ResourceNotFoundException("BatDongSan", "mabds", giaDinh.getMaBDS());
        }
        
        giaDinh.setNgayTao(LocalDateTime.now());
        GiaDinh savedGiaDinh = giaDinhRepository.save(giaDinh);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Tạo gia đình thành công", savedGiaDinh));
    }

    @PutMapping("/{maGiaDinh}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<GiaDinh>> updateGiaDinh(
            @PathVariable String maGiaDinh,
            @RequestBody GiaDinh giaDinhDetails) {
        GiaDinh giaDinh = giaDinhRepository.findById(maGiaDinh)
                .orElseThrow(() -> new ResourceNotFoundException("GiaDinh", "maGiaDinh", maGiaDinh));

        // Kiểm tra chủ hộ có tồn tại không (nếu có)
        if (giaDinhDetails.getCccdChuHo() != null && 
            !nguoiDanRepository.existsById(giaDinhDetails.getCccdChuHo())) {
            throw new ResourceNotFoundException("NguoiDan", "cccd", giaDinhDetails.getCccdChuHo());
        }
        
        // Kiểm tra bất động sản có tồn tại không (nếu có)
        if (giaDinhDetails.getMaBDS() != null && 
            !batDongSanRepository.existsById(giaDinhDetails.getMaBDS())) {
            throw new ResourceNotFoundException("BatDongSan", "mabds", giaDinhDetails.getMaBDS());
        }

        giaDinh.setCccdChuHo(giaDinhDetails.getCccdChuHo());
        giaDinh.setMaBDS(giaDinhDetails.getMaBDS());
        giaDinh.setSoThanhVien(giaDinhDetails.getSoThanhVien());
        giaDinh.setNgayCapNhat(LocalDateTime.now());

        GiaDinh updatedGiaDinh = giaDinhRepository.save(giaDinh);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật gia đình thành công", updatedGiaDinh));
    }

    @DeleteMapping("/{maGiaDinh}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteGiaDinh(@PathVariable String maGiaDinh) {
        GiaDinh giaDinh = giaDinhRepository.findById(maGiaDinh)
                .orElseThrow(() -> new ResourceNotFoundException("GiaDinh", "maGiaDinh", maGiaDinh));
        
        // Notify all members before deleting
        List<NguoiDan> members = nguoiDanRepository.findByMaGiaDinh(maGiaDinh);
        for (NguoiDan member : members) {
            try {
                thongBaoService.createPersonalNotification(
                    NotificationConstants.TITLE_FAMILY_DISSOLVED,
                    String.format(NotificationConstants.CONTENT_FAMILY_DISSOLVED, maGiaDinh),
                    member.getCccd(),
                    NotificationConstants.URGENCY_URGENT
                );
                
                // Update member to remove family link
                member.setMaGiaDinh(null);
                nguoiDanRepository.save(member);
            } catch (Exception e) {
                System.err.println("Failed to process member " + member.getCccd() + " during family deletion: " + e.getMessage());
            }
        }
        
        giaDinhRepository.delete(giaDinh);
        return ResponseEntity.ok(new ApiResponse<>(true, "Xóa gia đình thành công", null));
    }
}
