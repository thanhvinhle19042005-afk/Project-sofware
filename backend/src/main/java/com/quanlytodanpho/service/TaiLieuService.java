package com.quanlytodanpho.service;

import com.quanlytodanpho.dto.TaiLieuRequest;
import com.quanlytodanpho.entity.SuKien;
import com.quanlytodanpho.entity.TaiLieuSuKien;
import com.quanlytodanpho.repository.SuKienRepository;
import com.quanlytodanpho.repository.TaiLieuSuKienRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TaiLieuService {

    private final TaiLieuSuKienRepository taiLieuRepository;
    private final SuKienRepository suKienRepository;

    public List<TaiLieuSuKien> getDocumentsByEvent(Integer eventId) {
        return taiLieuRepository.findByMaSuKien(eventId);
    }

    @Transactional
    public TaiLieuSuKien addDocument(Integer eventId, TaiLieuRequest request) {
        SuKien suKien = suKienRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sự kiện"));

        TaiLieuSuKien taiLieu = new TaiLieuSuKien();
        taiLieu.setMaSuKien(eventId);
        taiLieu.setTenTaiLieu(request.getTenTaiLieu());
        taiLieu.setLoaiTaiLieu(request.getLoaiTaiLieu());
        taiLieu.setDuongDan(request.getDuongDanFile());
        taiLieu.setMoTa(request.getMoTa());
        taiLieu.setNgayUpload(LocalDateTime.now());

        return taiLieuRepository.save(taiLieu);
    }

    @Transactional
    public void deleteDocument(Integer documentId) {
        if (!taiLieuRepository.existsById(documentId)) {
            throw new RuntimeException("Không tìm thấy tài liệu");
        }
        taiLieuRepository.deleteById(documentId);
    }

    public String uploadFile(MultipartFile file) {
        // TODO: Implement file upload to cloud storage
        // For now, return a mock URL
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        String fileUrl = "https://storage.example.com/documents/" + fileName;

        // Here you would upload to AWS S3, Azure Blob, or similar service
        // Example:
        // s3Client.putObject(bucketName, fileName, file.getInputStream(), metadata);

        return fileUrl;
    }
}
