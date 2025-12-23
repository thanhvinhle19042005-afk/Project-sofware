package com.quanlytodanpho.repository;

import com.quanlytodanpho.entity.NguoiNhanThongBao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NguoiNhanThongBaoRepository extends JpaRepository<NguoiNhanThongBao, Integer> {
    List<NguoiNhanThongBao> findByMaThongBao(Integer maThongBao);
    List<NguoiNhanThongBao> findByCccdNguoiNhan(String cccdNguoiNhan);
    
    @Query("SELECT n FROM NguoiNhanThongBao n WHERE n.cccdNguoiNhan = :cccd AND n.daDoc = false")
    List<NguoiNhanThongBao> findUnreadByUser(@Param("cccd") String cccd);
}
