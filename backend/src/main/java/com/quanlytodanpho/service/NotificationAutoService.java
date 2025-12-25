package com.quanlytodanpho.service;

import com.quanlytodanpho.entity.*;
import com.quanlytodanpho.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationAutoService {

    private final ThongBaoRepository thongBaoRepository;
    private final NguoiNhanThongBaoRepository nguoiNhanRepository;
    private final TaiKhoanRepository taiKhoanRepository;
    private final LoaiThongBaoRepository loaiThongBaoRepository;
    private final VaiTroRepository vaiTroRepository;

    /**
     * Gửi thông báo tự động khi Admin tạo sự kiện mới
     */
    @Async
    @Transactional
    public void sendEventCreatedNotification(SuKien suKien) {
        try {
            log.info("Sending event created notification for: {}", suKien.getTenSuKien());

            // Lấy loại thông báo ACTIVE
            LoaiThongBao loaiThongBao = loaiThongBaoRepository.findByTenLoai("ACTIVE")
                    .orElseThrow(() -> new RuntimeException("Loại thông báo ACTIVE không tồn tại"));

            // Tạo thông báo
            ThongBao thongBao = new ThongBao();
            thongBao.setMaLoai(loaiThongBao.getMaLoai());
            thongBao.setTieuDe("Sự kiện mới: " + suKien.getTenSuKien());
            thongBao.setNoiDung(String.format(
                    "Có sự kiện mới \"%s\" sẽ diễn ra vào %s tại %s. Vui lòng đăng ký tham gia!",
                    suKien.getTenSuKien(),
                    suKien.getThoiGianBatDau(),
                    suKien.getDiaDiem()
            ));
            
            // Check if EMERGENCY
            // Check for both English and Vietnamese keywords to be safe
            if ("EMERGENCY".equalsIgnoreCase(suKien.getLoaiSuKien()) || "Khẩn cấp".equalsIgnoreCase(suKien.getLoaiSuKien())) {
                thongBao.setDoKhan("Khẩn cấp");
                thongBao.setTieuDe("KHẨN CẤP: " + suKien.getTenSuKien());
                thongBao.setNoiDung(String.format(
                    "THÔNG BÁO KHẨN: Sự kiện \"%s\" yêu cầu sự chú ý ngay lập tức. Thời gian: %s. Địa điểm: %s.",
                    suKien.getTenSuKien(),
                    suKien.getThoiGianBatDau(),
                    suKien.getDiaDiem()
                ));
            } else {
                thongBao.setDoKhan("Bình thường");
            }
            
            thongBao.setThoiGianGui(LocalDateTime.now());
            thongBao.setMaSuKien(suKien.getMaSuKien());

            ThongBao savedNotification = thongBaoRepository.save(thongBao);

            // Lấy MaVaiTro của Admin (giả sử là 1)
            VaiTro adminRole = vaiTroRepository.findByTenVaiTro("Admin").orElse(null);
            Integer adminRoleId = (adminRole != null) ? adminRole.getMaVaiTro() : 1;

            // Gửi đến tất cả người dùng (trừ Admin)
            List<TaiKhoan> allUsers = taiKhoanRepository.findAll();
            
            final Integer maThongBao = savedNotification.getMaThongBao();
            
            List<NguoiNhanThongBao> recipients = allUsers.stream()
                    .filter(user -> !user.getMaVaiTro().equals(adminRoleId))
                    .map(TaiKhoan::getCccd)
                    .filter(cccd -> cccd != null && !cccd.trim().isEmpty())
                    .distinct()
                    .map(cccd -> {
                        NguoiNhanThongBao nguoiNhan = new NguoiNhanThongBao();
                        nguoiNhan.setMaThongBao(maThongBao);
                        nguoiNhan.setCccdNguoiNhan(cccd);
                        nguoiNhan.setDaDoc(false);
                        return nguoiNhan;
                    })
                    .collect(Collectors.toList());

            if (!recipients.isEmpty()) {
                nguoiNhanRepository.saveAll(recipients);
            }

            log.info("Event notification sent successfully to {} recipients", recipients.size());
        } catch (Exception e) {
            log.error("Failed to send event notification", e);
        }
    }

    /**
     * Gửi thông báo nhắc nhở trước khi sự kiện diễn ra (1 ngày trước)
     */
    @Async
    @Transactional
    public void sendEventReminderNotification(SuKien suKien) {
        try {
            log.info("Sending event reminder for: {}", suKien.getTenSuKien());

            LoaiThongBao loaiThongBao = loaiThongBaoRepository.findByTenLoai("ACTIVE")
                    .orElseThrow(() -> new RuntimeException("Loại thông báo ACTIVE không tồn tại"));

            ThongBao thongBao = new ThongBao();
            thongBao.setMaLoai(loaiThongBao.getMaLoai());
            thongBao.setTieuDe("Nhắc nhở: Sự kiện sắp diễn ra - " + suKien.getTenSuKien());
            thongBao.setNoiDung(String.format(
                    "Sự kiện \"%s\" sẽ diễn ra vào ngày mai (%s) tại %s. Đừng quên tham gia!",
                    suKien.getTenSuKien(),
                    suKien.getThoiGianBatDau(),
                    suKien.getDiaDiem()
            ));
            thongBao.setDoKhan("Khẩn cấp");
            thongBao.setThoiGianGui(LocalDateTime.now());
            thongBao.setMaSuKien(suKien.getMaSuKien());

            ThongBao savedNotification = thongBaoRepository.save(thongBao);

            VaiTro adminRole = vaiTroRepository.findByTenVaiTro("ROLE_ADMIN").orElse(null);
            Integer adminRoleId = (adminRole != null) ? adminRole.getMaVaiTro() : 1;

            // Gửi đến người đã đăng ký
            List<TaiKhoan> allUsers = taiKhoanRepository.findAll();
            for (TaiKhoan user : allUsers) {
                if (user.getMaVaiTro().equals(adminRoleId)) continue;
                if (user.getCccd() == null) continue;

                NguoiNhanThongBao nguoiNhan = new NguoiNhanThongBao();
                nguoiNhan.setMaThongBao(savedNotification.getMaThongBao());
                nguoiNhan.setCccdNguoiNhan(user.getCccd());
                nguoiNhan.setDaDoc(false);
                nguoiNhanRepository.save(nguoiNhan);
            }

            log.info("Event reminder sent successfully");
        } catch (Exception e) {
            log.error("Failed to send event reminder", e);
        }
    }

    /**
     * Gửi thông báo khi có biên bản mới
     */
    @Async
    @Transactional
    public void sendMeetingMinutesNotification(SuKien suKien) {
        try {
            log.info("Sending meeting minutes notification for: {}", suKien.getTenSuKien());

            LoaiThongBao loaiThongBao = loaiThongBaoRepository.findByTenLoai("PASSIVE")
                    .orElseThrow(() -> new RuntimeException("Loại thông báo PASSIVE không tồn tại"));

            ThongBao thongBao = new ThongBao();
            thongBao.setMaLoai(loaiThongBao.getMaLoai());
            thongBao.setTieuDe("Biên bản cuộc họp: " + suKien.getTenSuKien());
            thongBao.setNoiDung(String.format(
                    "Biên bản cuộc họp \"%s\" đã được cập nhật. Vui lòng xem chi tiết.",
                    suKien.getTenSuKien()
            ));
            thongBao.setDoKhan("Bình thường");
            thongBao.setThoiGianGui(LocalDateTime.now());
            thongBao.setMaSuKien(suKien.getMaSuKien());

            ThongBao savedNotification = thongBaoRepository.save(thongBao);

            // Gửi đến tất cả người dùng
            List<TaiKhoan> allUsers = taiKhoanRepository.findAll();
            for (TaiKhoan user : allUsers) {
                if (user.getCccd() == null) continue;

                NguoiNhanThongBao nguoiNhan = new NguoiNhanThongBao();
                nguoiNhan.setMaThongBao(savedNotification.getMaThongBao());
                nguoiNhan.setCccdNguoiNhan(user.getCccd());
                nguoiNhan.setDaDoc(false);
                nguoiNhanRepository.save(nguoiNhan);
            }

            log.info("Meeting minutes notification sent successfully");
        } catch (Exception e) {
            log.error("Failed to send meeting minutes notification", e);
        }
    }

    /**
     * Gửi thông báo khi có tài liệu mới được thêm vào sự kiện
     */
    @Async
    @Transactional
    public void sendDocumentAddedNotification(SuKien suKien, String documentName) {
        try {
            log.info("Sending document added notification for: {}", documentName);

            LoaiThongBao loaiThongBao = loaiThongBaoRepository.findByTenLoai("PASSIVE")
                    .orElseThrow(() -> new RuntimeException("Loại thông báo PASSIVE không tồn tại"));

            ThongBao thongBao = new ThongBao();
            thongBao.setMaLoai(loaiThongBao.getMaLoai());
            thongBao.setTieuDe("Tài liệu mới: " + suKien.getTenSuKien());
            thongBao.setNoiDung(String.format(
                    "Tài liệu \"%s\" đã được thêm vào sự kiện \"%s\". Vui lòng xem chi tiết.",
                    documentName,
                    suKien.getTenSuKien()
            ));
            thongBao.setDoKhan("Bình thường");
            thongBao.setThoiGianGui(LocalDateTime.now());
            thongBao.setMaSuKien(suKien.getMaSuKien());

            ThongBao savedNotification = thongBaoRepository.save(thongBao);

            // Gửi đến người đã đăng ký sự kiện
            List<TaiKhoan> allUsers = taiKhoanRepository.findAll();
            for (TaiKhoan user : allUsers) {
                if (user.getCccd() == null) continue;

                NguoiNhanThongBao nguoiNhan = new NguoiNhanThongBao();
                nguoiNhan.setMaThongBao(savedNotification.getMaThongBao());
                nguoiNhan.setCccdNguoiNhan(user.getCccd());
                nguoiNhan.setDaDoc(false);
                nguoiNhanRepository.save(nguoiNhan);
            }

            log.info("Document notification sent successfully");
        } catch (Exception e) {
            log.error("Failed to send document notification", e);
        }
    }
}
