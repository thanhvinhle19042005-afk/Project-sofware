package com.quanlytodanpho.repository;

import com.quanlytodanpho.entity.DangKySuKien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DangKySuKienRepository extends JpaRepository<DangKySuKien, Integer> {
    List<DangKySuKien> findByMaSuKien(Integer maSuKien);
    List<DangKySuKien> findByCccdNguoiDangKy(String cccdNguoiDangKy);
    Optional<DangKySuKien> findByMaSuKienAndCccdNguoiDangKy(Integer maSuKien, String cccdNguoiDangKy);
    
    @Query("SELECT COUNT(d) FROM DangKySuKien d WHERE d.maSuKien = :maSuKien AND d.trangThai NOT IN ('Hủy đăng ký', 'Vắng mặt')")
    Long countActiveRegistrations(@Param("maSuKien") Integer maSuKien);
    
    @Query("SELECT d FROM DangKySuKien d WHERE d.maSuKien = :maSuKien AND d.trangThai = :trangThai")
    List<DangKySuKien> findByMaSuKienAndTrangThai(@Param("maSuKien") Integer maSuKien, @Param("trangThai") String trangThai);
}
