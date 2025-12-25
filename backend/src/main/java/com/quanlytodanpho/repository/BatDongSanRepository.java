package com.quanlytodanpho.repository;

import com.quanlytodanpho.entity.BatDongSan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BatDongSanRepository extends JpaRepository<BatDongSan, String> {
    List<BatDongSan> findByCccdChuSoHuu(String cccdChuSoHuu);
}
