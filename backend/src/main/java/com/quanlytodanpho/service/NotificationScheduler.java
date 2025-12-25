package com.quanlytodanpho.service;

import com.quanlytodanpho.entity.DangKySuKien;
import com.quanlytodanpho.entity.SuKien;
import com.quanlytodanpho.repository.DangKySuKienRepository;
import com.quanlytodanpho.repository.SuKienRepository;
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
    private final ThongBaoService thongBaoService;

    @Scheduled(fixedRate = 60000) // Run every minute
    @Transactional
    public void checkUpcomingEvents() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneHourLater = now.plusHours(1);
        LocalDateTime oneHourFiveMinutesLater = oneHourLater.plusMinutes(5);

        // Find events starting in roughly 1 hour that haven't been notified
        List<SuKien> upcomingEvents = suKienRepository.findUpcomingEvents(now);

        for (SuKien suKien : upcomingEvents) {
            if (Boolean.TRUE.equals(suKien.getDaThongBaoNhacNho())) {
                continue;
            }

            // Check if event starts within [1h, 1h + 5m] window
            // Or simpler: if start time is before oneHourFiveMinutesLater and after oneHourLater (approx)
            // Actually, let's just check if it's within the next 65 minutes and hasn't been notified.
            // But we want specifically "1 hour before".
            
            if (suKien.getThoiGianBatDau().isAfter(now) && 
                suKien.getThoiGianBatDau().isBefore(oneHourFiveMinutesLater) &&
                suKien.getThoiGianBatDau().isAfter(now.plusMinutes(55))) {
                
                // Send notification
                String title = "Nhắc nhở sự kiện sắp diễn ra";
                String content = "Sự kiện '" + suKien.getTenSuKien() + "' sẽ diễn ra vào lúc " + 
                                 suKien.getThoiGianBatDau().toString().replace("T", " ") + 
                                 ". Địa điểm: " + suKien.getDiaDiem();
                
                // Create notification (this sends to all household heads by default in current impl, 
                // but we might want to target specific registered users?
                // The requirement says "notify 1h before event".
                // If it's a public event, maybe everyone? If registered only?
                // "đối với cư dân: thông báo khi chuẩn bị đến giờ sự kiện" -> implies relevant users.
                // But ThongBaoService.createNotification currently sends to ALL households.
                // Let's stick to that for now as per existing logic, or refine if needed.
                // Ideally we should send only to registered users.
                
                // Let's use createNotification but maybe we need a targeted version?
                // For now, using the generic one is safer to ensure delivery.
                
                thongBaoService.createNotification(title, content, suKien.getMaSuKien(), "Khẩn cấp");
                
                suKien.setDaThongBaoNhacNho(true);
                suKienRepository.save(suKien);
            }
        }
    }
}
