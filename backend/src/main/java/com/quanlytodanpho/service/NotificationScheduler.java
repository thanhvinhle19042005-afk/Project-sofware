package com.quanlytodanpho.service;

import com.quanlytodanpho.constant.NotificationConstants;
import com.quanlytodanpho.entity.DangKySuKien;
import com.quanlytodanpho.entity.SuKien;
import com.quanlytodanpho.repository.DangKySuKienRepository;
import com.quanlytodanpho.repository.SuKienRepository;
import com.quanlytodanpho.repository.ThongBaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class NotificationScheduler {

    private final SuKienRepository suKienRepository;
    private final DangKySuKienRepository dangKySuKienRepository;
    private final ThongBaoRepository thongBaoRepository;
    private final ThongBaoService thongBaoService;

    @Scheduled(fixedRate = 3600000) // Run every hour
    @Transactional
    public void checkUpcomingEvents() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime next24h = now.plusHours(24);
        
        // Find events starting in the next 24 hours
        List<SuKien> upcomingEvents = suKienRepository.findEventsStartingBetween(now, next24h);
        
        for (SuKien event : upcomingEvents) {
            List<DangKySuKien> participants = dangKySuKienRepository.findByMaSuKien(event.getMaSuKien());
            
            for (DangKySuKien p : participants) {
                // Only notify active registrations
                if (!"Đã đăng ký".equals(p.getTrangThai())) continue;
                
                // Check if reminder already sent
                boolean sent = thongBaoRepository.hasSentReminder(p.getCccdNguoiDangKy(), event.getMaSuKien(), NotificationConstants.TITLE_EVENT_REMINDER);
                
                if (!sent) {
                    try {
                        thongBaoService.createPersonalNotification(
                            NotificationConstants.TITLE_EVENT_REMINDER + ": " + event.getTenSuKien(),
                            String.format(NotificationConstants.CONTENT_EVENT_REMINDER, event.getTenSuKien(), event.getThoiGianBatDau()),
                            p.getCccdNguoiDangKy(),
                            NotificationConstants.URGENCY_NORMAL
                        );
                    } catch (Exception e) {
                        System.err.println("Failed to send reminder for event " + event.getMaSuKien() + " to user " + p.getCccdNguoiDangKy());
                    }
                }
            }
        }
    }
}
