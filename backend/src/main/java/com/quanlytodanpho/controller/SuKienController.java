package com.quanlytodanpho.controller;

import com.quanlytodanpho.dto.ApiResponse;
import com.quanlytodanpho.dto.CreateSuKienRequest;
import com.quanlytodanpho.dto.SuKienDTO;
import com.quanlytodanpho.service.SuKienService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class SuKienController {
    
    private final SuKienService suKienService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<SuKienDTO>>> getAllEvents() {
        try {
            List<SuKienDTO> events = suKienService.getAllSuKien();
            return ResponseEntity.ok(ApiResponse.success(events));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<List<SuKienDTO>>> getUpcomingEvents() {
        try {
            List<SuKienDTO> events = suKienService.getUpcomingSuKien();
            return ResponseEntity.ok(ApiResponse.success(events));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SuKienDTO>> getEventById(@PathVariable Integer id) {
        try {
            SuKienDTO event = suKienService.getSuKienById(id);
            return ResponseEntity.ok(ApiResponse.success(event));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/joined")
    public ResponseEntity<ApiResponse<List<SuKienDTO>>> getJoinedEvents() {
        try {
            List<SuKienDTO> events = suKienService.getJoinedEvents();
            return ResponseEntity.ok(ApiResponse.success(events));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/not-joined")
    public ResponseEntity<ApiResponse<List<SuKienDTO>>> getNotJoinedEvents() {
        try {
            List<SuKienDTO> events = suKienService.getNotJoinedEvents();
            return ResponseEntity.ok(ApiResponse.success(events));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SuKienDTO>> createEvent(@Valid @RequestBody CreateSuKienRequest request) {
        try {
            SuKienDTO event = suKienService.createSuKien(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Tạo sự kiện thành công", event));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SuKienDTO>> updateEvent(@PathVariable Integer id, @Valid @RequestBody CreateSuKienRequest request) {
        try {
            SuKienDTO event = suKienService.updateSuKien(id, request);
            return ResponseEntity.ok(ApiResponse.success("Cập nhật sự kiện thành công", event));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> approveEvent(@PathVariable Integer id) {
        try {
            suKienService.approveSuKien(id);
            return ResponseEntity.ok(ApiResponse.success("Phê duyệt sự kiện thành công", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> rejectEvent(@PathVariable Integer id) {
        try {
            suKienService.rejectSuKien(id);
            return ResponseEntity.ok(ApiResponse.success("Đã hủy sự kiện", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(@PathVariable Integer id) {
        try {
            suKienService.deleteSuKien(id);
            return ResponseEntity.ok(ApiResponse.success("Xóa sự kiện thành công", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
