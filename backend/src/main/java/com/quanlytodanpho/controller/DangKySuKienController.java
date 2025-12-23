package com.quanlytodanpho.controller;

import com.quanlytodanpho.dto.ApiResponse;
import com.quanlytodanpho.dto.DangKySuKienDTO;
import com.quanlytodanpho.service.DangKySuKienService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/registrations")
@RequiredArgsConstructor
public class DangKySuKienController {
    
    private final DangKySuKienService dangKySuKienService;
    
    @PostMapping("/register/{eventId}")
    public ResponseEntity<ApiResponse<DangKySuKienDTO>> registerForEvent(
            @PathVariable Integer eventId,
            @RequestBody(required = false) Map<String, String> request) {
        try {
            String ghiChu = request != null ? request.get("ghiChu") : null;
            DangKySuKienDTO registration = dangKySuKienService.registerForEvent(eventId, ghiChu);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Đăng ký tham gia thành công", registration));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @DeleteMapping("/{registrationId}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelRegistration(@PathVariable Integer registrationId) {
        try {
            dangKySuKienService.cancelRegistration(registrationId);
            return ResponseEntity.ok(ApiResponse.success("Hủy đăng ký thành công", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/my-registrations")
    public ResponseEntity<ApiResponse<List<DangKySuKienDTO>>> getMyRegistrations() {
        try {
            List<DangKySuKienDTO> registrations = dangKySuKienService.getMyRegistrations();
            return ResponseEntity.ok(ApiResponse.success(registrations));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/event/{eventId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<DangKySuKienDTO>>> getEventRegistrations(@PathVariable Integer eventId) {
        try {
            List<DangKySuKienDTO> registrations = dangKySuKienService.getRegistrationsByEvent(eventId);
            return ResponseEntity.ok(ApiResponse.success(registrations));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
