package com.quanlytodanpho.controller;

import com.quanlytodanpho.dto.ApiResponse;
import com.quanlytodanpho.dto.LoginRequest;
import com.quanlytodanpho.dto.LoginResponse;
import com.quanlytodanpho.dto.RegisterRequest;
import com.quanlytodanpho.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công", response));
    }
    
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("Đăng ký thành công", "Tài khoản đã được tạo"));
    }
    
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<?>> getCurrentUser() {
        return ResponseEntity.ok(ApiResponse.success(authService.getCurrentUser()));
    }
    
    @PostMapping("/update-cccd")
    public ResponseEntity<ApiResponse<String>> updateAccountWithCCCD(
            @RequestParam String tenDangNhap, 
            @RequestParam String cccd) {
        authService.updateAccountWithCCCD(tenDangNhap, cccd);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật CCCD thành công", null));
    }

    @GetMapping("/admins")
    public ResponseEntity<ApiResponse<?>> getAdmins() {
        return ResponseEntity.ok(ApiResponse.success(authService.getAdmins()));
    }
}
