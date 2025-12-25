package com.quanlytodanpho.repository;

import com.quanlytodanpho.entity.ThongBao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ThongBaoRepository extends JpaRepository<ThongBao, Integer> {
    List<ThongBao> findByMaSuKien(Integer maSuKien);
    List<ThongBao> findByTrangThai(String trangThai);
    
    @Query("SELECT t FROM ThongBao t WHERE t.thoiGianGui >= :startDate ORDER BY t.thoiGianGui DESC")
    List<ThongBao> findRecentNotifications(@Param("startDate") LocalDateTime startDate);
}
