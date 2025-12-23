package com.quanlytodanpho.controller;

import com.quanlytodanpho.dto.ApiResponse;
import com.quanlytodanpho.dto.ThongBaoDTO;
import com.quanlytodanpho.service.ThongBaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class ThongBaoController {
    
    private final ThongBaoService thongBaoService;
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ThongBaoDTO>> createNotification(@RequestBody Map<String, Object> request) {
        try {
            String tieuDe = (String) request.get("tieuDe");
            String noiDung = (String) request.get("noiDung");
            Integer maSuKien = request.get("maSuKien") != null ? (Integer) request.get("maSuKien") : null;
            String doKhan = (String) request.getOrDefault("doKhan", "Bình thường");
            
            ThongBaoDTO notification = thongBaoService.createNotification(tieuDe, noiDung, maSuKien, doKhan);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Gửi thông báo thành công", notification));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/my-notifications")
    public ResponseEntity<ApiResponse<List<ThongBaoDTO>>> getMyNotifications() {
        try {
            List<ThongBaoDTO> notifications = thongBaoService.getMyNotifications();
            return ResponseEntity.ok(ApiResponse.success(notifications));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Integer notificationId) {
        try {
            thongBaoService.markAsRead(notificationId);
            return ResponseEntity.ok(ApiResponse.success("Đã đánh dấu đã đọc", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
