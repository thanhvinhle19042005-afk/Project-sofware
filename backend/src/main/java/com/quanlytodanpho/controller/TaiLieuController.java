package com.quanlytodanpho.controller;

import com.quanlytodanpho.dto.ApiResponse;
import com.quanlytodanpho.dto.TaiLieuRequest;
import com.quanlytodanpho.entity.TaiLieuSuKien;
import com.quanlytodanpho.service.TaiLieuService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/events/{eventId}/documents")
@RequiredArgsConstructor
public class TaiLieuController {

    private final TaiLieuService taiLieuService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TaiLieuSuKien>>> getEventDocuments(@PathVariable Integer eventId) {
        try {
            List<TaiLieuSuKien> documents = taiLieuService.getDocumentsByEvent(eventId);
            return ResponseEntity.ok(ApiResponse.success(documents));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TaiLieuSuKien>> addDocument(
            @PathVariable Integer eventId,
            @Valid @RequestBody TaiLieuRequest request) {
        try {
            TaiLieuSuKien document = taiLieuService.addDocument(eventId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(
                    ApiResponse.success("Thêm tài liệu thành công", document));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{documentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(
            @PathVariable Integer eventId,
            @PathVariable Integer documentId) {
        try {
            taiLieuService.deleteDocument(documentId);
            return ResponseEntity.ok(ApiResponse.success("Xóa tài liệu thành công", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/upload")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> uploadFile(
            @PathVariable Integer eventId,
            @RequestParam("file") MultipartFile file) {
        try {
            // TODO: Implement file upload to cloud storage (AWS S3, Azure Blob, etc.)
            String fileUrl = taiLieuService.uploadFile(file);
            return ResponseEntity.ok(ApiResponse.success("Upload file thành công", fileUrl));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
