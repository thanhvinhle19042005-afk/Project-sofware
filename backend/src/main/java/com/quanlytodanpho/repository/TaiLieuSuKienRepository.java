package com.quanlytodanpho.repository;

import com.quanlytodanpho.entity.TaiLieuSuKien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaiLieuSuKienRepository extends JpaRepository<TaiLieuSuKien, Integer> {
    List<TaiLieuSuKien> findByMaSuKien(Integer maSuKien);
}
