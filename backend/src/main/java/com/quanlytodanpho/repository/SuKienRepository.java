package com.quanlytodanpho.repository;

import com.quanlytodanpho.entity.SuKien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SuKienRepository extends JpaRepository<SuKien, Integer> {
    List<SuKien> findByTrangThai(String trangThai);
    List<SuKien> findByLoaiSuKien(String loaiSuKien);
    
    @Query("SELECT s FROM SuKien s WHERE s.thoiGianBatDau >= :startDate ORDER BY s.thoiGianBatDau ASC")
    List<SuKien> findUpcomingEvents(@Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT s FROM SuKien s WHERE s.trangThai IN :statuses AND s.thoiGianBatDau >= :now ORDER BY s.thoiGianBatDau ASC")
    List<SuKien> findActiveEvents(@Param("statuses") List<String> statuses, @Param("now") LocalDateTime now);
    
    @Query("SELECT s FROM SuKien s WHERE s.thoiGianBatDau BETWEEN :start AND :end ORDER BY s.thoiGianBatDau ASC")
    List<SuKien> findEventsByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT s FROM SuKien s JOIN DangKySuKien d ON s.maSuKien = d.maSuKien WHERE d.cccdNguoiDangKy = :cccd AND d.trangThai != 'Hủy đăng ký' ORDER BY s.thoiGianBatDau ASC")
    List<SuKien> findJoinedEvents(@Param("cccd") String cccd);

    @Query("SELECT s FROM SuKien s WHERE s.maSuKien NOT IN (SELECT d.maSuKien FROM DangKySuKien d WHERE d.cccdNguoiDangKy = :cccd AND d.trangThai != 'Hủy đăng ký') ORDER BY s.thoiGianBatDau ASC")
    List<SuKien> findNotJoinedEvents(@Param("cccd") String cccd);
}
