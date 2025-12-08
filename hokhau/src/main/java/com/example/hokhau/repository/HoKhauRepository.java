// src/main/java/com/example/hokhau/repository/HoKhauRepository.java
package com.example.hokhau.repository;
import com.example.hokhau.model.HoKhau;
import org.springframework.data.jpa.repository.JpaRepository;

// Kế thừa JpaRepository: Spring sẽ tự động cung cấp các hàm CRUD cơ bản 
// như save(), findAll(), deleteById(), v.v.
public interface HoKhauRepository extends JpaRepository<HoKhau, Integer> {
    // Không cần viết thêm code gì!
}