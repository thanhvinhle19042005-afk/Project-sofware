package com.quanlytodanpho.repository;

import com.quanlytodanpho.entity.LoaiThongBao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LoaiThongBaoRepository extends JpaRepository<LoaiThongBao, Integer> {
    Optional<LoaiThongBao> findByTenLoai(String tenLoai);
}
