package com.quanlytodanpho.repository;

import com.quanlytodanpho.entity.TaiKhoan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaiKhoanRepository extends JpaRepository<TaiKhoan, Integer> {
    Optional<TaiKhoan> findByTenDangNhap(String tenDangNhap);
    Optional<TaiKhoan> findByCccd(String cccd);
    boolean existsByTenDangNhap(String tenDangNhap);
    List<TaiKhoan> findByMaVaiTro(Integer maVaiTro);
}
