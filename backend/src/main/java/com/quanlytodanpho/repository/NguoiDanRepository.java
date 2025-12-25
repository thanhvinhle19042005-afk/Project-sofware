package com.quanlytodanpho.repository;

import com.quanlytodanpho.entity.NguoiDan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NguoiDanRepository extends JpaRepository<NguoiDan, String> {
    List<NguoiDan> findByMaGiaDinh(String maGiaDinh);
    List<NguoiDan> findByTamChu(Boolean tamChu);
    
    @Query("SELECT n FROM NguoiDan n WHERE n.hoTen LIKE %:keyword% OR n.cccd LIKE %:keyword%")
    List<NguoiDan> searchByHoTenOrCccd(@Param("keyword") String keyword);

    long countByMaGiaDinh(String maGiaDinh);
}
