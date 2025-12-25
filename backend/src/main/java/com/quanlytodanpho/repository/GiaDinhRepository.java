package com.quanlytodanpho.repository;

import com.quanlytodanpho.entity.GiaDinh;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GiaDinhRepository extends JpaRepository<GiaDinh, String> {
}
