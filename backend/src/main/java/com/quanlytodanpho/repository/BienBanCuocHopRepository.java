package com.quanlytodanpho.repository;

import com.quanlytodanpho.entity.BienBanCuocHop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BienBanCuocHopRepository extends JpaRepository<BienBanCuocHop, Integer> {
    Optional<BienBanCuocHop> findByMaSuKien(Integer maSuKien);
}
