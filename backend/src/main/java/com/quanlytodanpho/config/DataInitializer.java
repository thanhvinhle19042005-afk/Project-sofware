package com.quanlytodanpho.config;

import com.quanlytodanpho.entity.LoaiThongBao;
import com.quanlytodanpho.entity.NguoiDan;
import com.quanlytodanpho.entity.VaiTro;
import com.quanlytodanpho.entity.TaiKhoan;
import com.quanlytodanpho.repository.LoaiThongBaoRepository;
import com.quanlytodanpho.repository.NguoiDanRepository;
import com.quanlytodanpho.repository.TaiKhoanRepository;
import com.quanlytodanpho.repository.VaiTroRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {
    
    private final VaiTroRepository vaiTroRepository;
    private final TaiKhoanRepository taiKhoanRepository;
    private final NguoiDanRepository nguoiDanRepository;
    private final LoaiThongBaoRepository loaiThongBaoRepository;
    private final PasswordEncoder passwordEncoder;
    
    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void initData() {
        try {
        // Initialize roles
        if (vaiTroRepository.count() == 0) {
            VaiTro adminRole = new VaiTro();
            adminRole.setTenVaiTro("Admin");
            adminRole.setMoTa("Quản trị viên hệ thống");
            vaiTroRepository.save(adminRole);
            
            VaiTro userRole = new VaiTro();
            userRole.setTenVaiTro("User");
            userRole.setMoTa("Người dùng thường");
            vaiTroRepository.save(userRole);
            
            System.out.println("✓ Đã khởi tạo vai trò");
        }
        
        // Initialize notification types
        if (loaiThongBaoRepository.count() == 0) {
            LoaiThongBao passiveType = new LoaiThongBao();
            passiveType.setTenLoai("Passive");
            passiveType.setMoTa("Thông báo thụ động");
            loaiThongBaoRepository.save(passiveType);
            
            LoaiThongBao activeType = new LoaiThongBao();
            activeType.setTenLoai("Active");
            activeType.setMoTa("Thông báo chủ động");
            loaiThongBaoRepository.save(activeType);
            
            System.out.println("✓ Đã khởi tạo loại thông báo");
        }
        
        // Create admin account if not exists
        if (!taiKhoanRepository.existsByTenDangNhap("admin")) {
            VaiTro adminRole = vaiTroRepository.findByTenVaiTro("Admin")
                    .orElseThrow(() -> new RuntimeException("Admin role not found"));
            
            TaiKhoan admin = new TaiKhoan();
            admin.setTenDangNhap("admin");
            admin.setMatKhau(passwordEncoder.encode("admin123"));
            admin.setMaVaiTro(adminRole.getMaVaiTro());
            admin.setTrangThai(true);
            taiKhoanRepository.save(admin);
            
            System.out.println("✓ Đã tạo tài khoản admin (username: admin, password: admin123)");
        }
        
        // Create user account if not exists
        if (!taiKhoanRepository.existsByTenDangNhap("user")) {
            VaiTro userRole = vaiTroRepository.findByTenVaiTro("User")
                    .orElseThrow(() -> new RuntimeException("User role not found"));
            
            TaiKhoan user = new TaiKhoan();
            user.setTenDangNhap("user");
            user.setMatKhau(passwordEncoder.encode("user123"));
            user.setMaVaiTro(userRole.getMaVaiTro());
            user.setTrangThai(true);
            taiKhoanRepository.save(user);
            
            System.out.println("✓ Đã tạo tài khoản user (username: user, password: user123)");
        }
        
        // Create test admin account
        if (!taiKhoanRepository.existsByTenDangNhap("testadmin")) {
            VaiTro adminRole = vaiTroRepository.findByTenVaiTro("Admin")
                    .orElseThrow(() -> new RuntimeException("Admin role not found"));
            
            TaiKhoan testAdmin = new TaiKhoan();
            testAdmin.setTenDangNhap("testadmin");
            testAdmin.setMatKhau(passwordEncoder.encode("test123"));
            testAdmin.setMaVaiTro(adminRole.getMaVaiTro());
            testAdmin.setTrangThai(true);
            taiKhoanRepository.save(testAdmin);
            
            System.out.println("✓ Đã tạo tài khoản testadmin (username: testadmin, password: test123)");
        }
        
        // Create nguoidan test account with citizen record
        if (!taiKhoanRepository.existsByTenDangNhap("nguoidan")) {
            VaiTro userRole = vaiTroRepository.findByTenVaiTro("User")
                    .orElseThrow(() -> new RuntimeException("User role not found"));
            
            // Create NguoiDan record first
            NguoiDan nguoiDanEntity = new NguoiDan();
            nguoiDanEntity.setCccd("001234567890");
            nguoiDanEntity.setHoTen("Nguyễn Văn A");
            nguoiDanEntity.setNgaySinh(LocalDate.of(1990, 1, 1));
            nguoiDanEntity.setGioiTinh("Nam");
            nguoiDanEntity.setEmail("nguoidan@example.com");
            nguoiDanEntity.setSoDienThoai("0123456789");
            nguoiDanRepository.save(nguoiDanEntity);
            
            // Then create TaiKhoan linked to NguoiDan
            TaiKhoan nguoidan = new TaiKhoan();
            nguoidan.setTenDangNhap("nguoidan");
            nguoidan.setMatKhau(passwordEncoder.encode("nguoidan123"));
            nguoidan.setMaVaiTro(userRole.getMaVaiTro());
            nguoidan.setCccd("001234567890");
            nguoidan.setTrangThai(true);
            taiKhoanRepository.save(nguoidan);
            
            System.out.println("✓ Đã tạo tài khoản nguoidan với hồ sơ người dân (username: nguoidan, password: nguoidan123)");
        }
        
        log.info("=== Khởi tạo dữ liệu hoàn tất ===");
        } catch (Exception e) {
            log.error("Lỗi khởi tạo dữ liệu: {}", e.getMessage(), e);
        }
    }
}
