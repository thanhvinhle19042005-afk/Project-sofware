package com.quanlytodanpho.security;

import com.quanlytodanpho.entity.TaiKhoan;
import com.quanlytodanpho.entity.VaiTro;
import com.quanlytodanpho.repository.TaiKhoanRepository;
import com.quanlytodanpho.repository.VaiTroRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    
    private final TaiKhoanRepository taiKhoanRepository;
    private final VaiTroRepository vaiTroRepository;
    
    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        TaiKhoan taiKhoan = taiKhoanRepository.findByTenDangNhap(username)
                .orElseThrow(() -> new UsernameNotFoundException("Tài khoản không tồn tại: " + username));
        
        if (!taiKhoan.getTrangThai()) {
            throw new UsernameNotFoundException("Tài khoản đã bị vô hiệu hóa");
        }
        
        VaiTro vaiTro = vaiTroRepository.findById(taiKhoan.getMaVaiTro())
                .orElseThrow(() -> new UsernameNotFoundException("Vai trò không tồn tại"));
        
        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_" + vaiTro.getTenVaiTro().toUpperCase()));
        
        return User.builder()
                .username(taiKhoan.getTenDangNhap())
                .password(taiKhoan.getMatKhau())
                .authorities(authorities)
                .build();
    }
}
