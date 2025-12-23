package com.quanlytodanpho.controller;

import com.quanlytodanpho.dto.ApiResponse;
import com.quanlytodanpho.dto.BienBanRequest;
import com.quanlytodanpho.entity.BienBanCuocHop;
import com.quanlytodanpho.service.BienBanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events/{eventId}/minutes")
@RequiredArgsConstructor
public class BienBanController {

    private final BienBanService bienBanService;

    @GetMapping
    public ResponseEntity<ApiResponse<BienBanCuocHop>> getEventMinutes(@PathVariable Integer eventId) {
        try {
            BienBanCuocHop minutes = bienBanService.getMinutesByEvent(eventId);
            return ResponseEntity.ok(ApiResponse.success(minutes));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BienBanCuocHop>> createMinutes(
            @PathVariable Integer eventId,
            @Valid @RequestBody BienBanRequest request) {
        try {
            BienBanCuocHop minutes = bienBanService.createMinutes(eventId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(
                    ApiResponse.success("Tạo biên bản thành công", minutes));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{minutesId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BienBanCuocHop>> updateMinutes(
            @PathVariable Integer eventId,
            @PathVariable Integer minutesId,
            @Valid @RequestBody BienBanRequest request) {
        try {
            BienBanCuocHop minutes = bienBanService.updateMinutes(minutesId, request);
            return ResponseEntity.ok(ApiResponse.success("Cập nhật biên bản thành công", minutes));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{minutesId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteMinutes(
            @PathVariable Integer eventId,
            @PathVariable Integer minutesId) {
        try {
            bienBanService.deleteMinutes(minutesId);
            return ResponseEntity.ok(ApiResponse.success("Xóa biên bản thành công", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
