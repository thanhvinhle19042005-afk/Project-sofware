package com.quanlytodanpho.service;

import com.quanlytodanpho.dto.LoginRequest;
import com.quanlytodanpho.dto.LoginResponse;
import com.quanlytodanpho.dto.RegisterRequest;
import com.quanlytodanpho.entity.GiaDinh;
import com.quanlytodanpho.entity.NguoiDan;
import com.quanlytodanpho.entity.TaiKhoan;
import com.quanlytodanpho.entity.VaiTro;
import com.quanlytodanpho.repository.GiaDinhRepository;
import com.quanlytodanpho.repository.NguoiDanRepository;
import com.quanlytodanpho.repository.TaiKhoanRepository;
import com.quanlytodanpho.repository.VaiTroRepository;
import com.quanlytodanpho.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final AuthenticationManager authenticationManager;
    private final TaiKhoanRepository taiKhoanRepository;
    private final VaiTroRepository vaiTroRepository;
    private final NguoiDanRepository nguoiDanRepository;
    private final GiaDinhRepository giaDinhRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    
    @Transactional
    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getTenDangNhap(),
                        request.getMatKhau()
                )
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String jwt = tokenProvider.generateToken(userDetails);
        
        TaiKhoan taiKhoan = taiKhoanRepository.findByTenDangNhap(request.getTenDangNhap())
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));
        
        // Update last login
        taiKhoan.setLanDangNhapCuoi(LocalDateTime.now());
        taiKhoanRepository.save(taiKhoan);
        
        VaiTro vaiTro = vaiTroRepository.findById(taiKhoan.getMaVaiTro())
                .orElseThrow(() -> new RuntimeException("Vai trò không tồn tại"));
        
        String hoTen = null;
        String maGiaDinh = null;
        if (taiKhoan.getCccd() != null) {
            NguoiDan nguoiDan = nguoiDanRepository.findById(taiKhoan.getCccd()).orElse(null);
            if (nguoiDan != null) {
                hoTen = nguoiDan.getHoTen();
                maGiaDinh = nguoiDan.getMaGiaDinh();
            }
        }
        
        LoginResponse response = new LoginResponse(jwt, taiKhoan.getMaTaiKhoan(), taiKhoan.getTenDangNhap(),
                taiKhoan.getCccd(), vaiTro.getTenVaiTro(), hoTen);
        response.setMaGiaDinh(maGiaDinh);
        return response;
    }
    
    @Transactional
    public void register(RegisterRequest request) {
        // Check if username already exists
        if (taiKhoanRepository.findByTenDangNhap(request.getTenDangNhap()).isPresent()) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại");
        }
        
        // Check/Create NguoiDan
        if (request.getCccd() != null && !request.getCccd().isEmpty()) {
            if (nguoiDanRepository.existsById(request.getCccd())) {
                // Check if this CCCD is already linked to another account
                if (taiKhoanRepository.findByCccd(request.getCccd()).isPresent()) {
                     throw new RuntimeException("CCCD này đã được đăng ký tài khoản");
                }
            } else {
                // Create new NguoiDan
                NguoiDan nguoiDan = new NguoiDan();
                nguoiDan.setCccd(request.getCccd());
                nguoiDan.setHoTen(request.getHoTen());
                nguoiDan.setNgaySinh(request.getNgaySinh());
                nguoiDan.setGioiTinh(request.getGioiTinh());
                nguoiDan.setSoDienThoai(request.getSoDienThoai());
                nguoiDan.setEmail(request.getEmail());
                nguoiDan.setTamChu(request.getTamChu());
                
                // Handle Household Head logic
                if (Boolean.TRUE.equals(request.getIsChuHo())) {
                    // Generate MaGiaDinh: GD + last 6 digits of CCCD + random 2 digits
                    String suffix = request.getCccd().length() >= 6 
                        ? request.getCccd().substring(request.getCccd().length() - 6) 
                        : request.getCccd();
                    int random = (int)(Math.random() * 90 + 10);
                    String maGiaDinh = "GD" + suffix + random;
                    
                    // Create GiaDinh
                    GiaDinh giaDinh = new GiaDinh();
                    giaDinh.setMaGiaDinh(maGiaDinh);
                    giaDinh.setCccdChuHo(request.getCccd());
                    giaDinh.setSoThanhVien(1);
                    giaDinh.setNgayTao(LocalDateTime.now());
                    giaDinhRepository.save(giaDinh);
                    
                    // Link NguoiDan to GiaDinh
                    nguoiDan.setMaGiaDinh(maGiaDinh);
                }
                
                nguoiDanRepository.save(nguoiDan);
            }
        }
        
        // Get User role (default role for registration)
        VaiTro userRole = vaiTroRepository.findByTenVaiTro("User")
                .orElseThrow(() -> new RuntimeException("Vai trò User không tồn tại"));
        
        // Create new account
        TaiKhoan taiKhoan = new TaiKhoan();
        taiKhoan.setTenDangNhap(request.getTenDangNhap());
        taiKhoan.setMatKhau(passwordEncoder.encode(request.getMatKhau()));
        taiKhoan.setCccd(request.getCccd());  // Set CCCD directly
        taiKhoan.setMaVaiTro(userRole.getMaVaiTro());
        taiKhoan.setTrangThai(true);
        taiKhoan.setNgayTao(LocalDateTime.now());
        
        taiKhoanRepository.save(taiKhoan);
    }
    
    public TaiKhoan getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return taiKhoanRepository.findByTenDangNhap(username)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));
    }
    
    @Transactional
    public void updateAccountWithCCCD(String tenDangNhap, String cccd) {
        TaiKhoan taiKhoan = taiKhoanRepository.findByTenDangNhap(tenDangNhap)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));
        
        // Check if CCCD exists in NguoiDan table
        nguoiDanRepository.findById(cccd)
                .orElseThrow(() -> new RuntimeException("CCCD không tồn tại trong hệ thống"));
        
        taiKhoan.setCccd(cccd);
        taiKhoan.setNgayCapNhat(LocalDateTime.now());
        taiKhoanRepository.save(taiKhoan);
    }

    public java.util.List<TaiKhoan> getAdmins() {
        VaiTro adminRole = vaiTroRepository.findByTenVaiTro("Admin")
                .orElseThrow(() -> new RuntimeException("Vai trò Admin không tồn tại"));
        return taiKhoanRepository.findByMaVaiTro(adminRole.getMaVaiTro());
    }
}
