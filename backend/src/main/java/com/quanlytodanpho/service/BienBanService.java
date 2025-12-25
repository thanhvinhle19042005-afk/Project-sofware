package com.quanlytodanpho.service;

import com.quanlytodanpho.dto.BienBanRequest;
import com.quanlytodanpho.entity.BienBanCuocHop;
import com.quanlytodanpho.entity.SuKien;
import com.quanlytodanpho.repository.BienBanCuocHopRepository;
import com.quanlytodanpho.repository.SuKienRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class BienBanService {

    private final BienBanCuocHopRepository bienBanRepository;
    private final SuKienRepository suKienRepository;

    public BienBanCuocHop getMinutesByEvent(Integer eventId) {
        return bienBanRepository.findByMaSuKien(eventId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy biên bản cho sự kiện này"));
    }

    @Transactional
    public BienBanCuocHop createMinutes(Integer eventId, BienBanRequest request) {
        SuKien suKien = suKienRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sự kiện"));

        // Check if minutes already exist
        if (bienBanRepository.findByMaSuKien(eventId).isPresent()) {
            throw new RuntimeException("Sự kiện đã có biên bản");
        }

        BienBanCuocHop bienBan = new BienBanCuocHop();
        bienBan.setMaSuKien(eventId);
        bienBan.setTieuDe(request.getNoiDung().substring(0, Math.min(100, request.getNoiDung().length())));
        bienBan.setNoiDungBienBan(request.getNoiDung());
        bienBan.setKetLuan(request.getKetLuan());
        bienBan.setNguoiLapId(request.getNguoiGhiNhan());
        bienBan.setNgayLap(LocalDateTime.now());

        return bienBanRepository.save(bienBan);
    }

    @Transactional
    public BienBanCuocHop updateMinutes(Integer minutesId, BienBanRequest request) {
        BienBanCuocHop bienBan = bienBanRepository.findById(minutesId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy biên bản"));

        bienBan.setTieuDe(request.getNoiDung().substring(0, Math.min(100, request.getNoiDung().length())));
        bienBan.setNoiDungBienBan(request.getNoiDung());
        bienBan.setKetLuan(request.getKetLuan());
        bienBan.setNguoiLapId(request.getNguoiGhiNhan());

        return bienBanRepository.save(bienBan);
    }

    @Transactional
    public void deleteMinutes(Integer minutesId) {
        if (!bienBanRepository.existsById(minutesId)) {
            throw new RuntimeException("Không tìm thấy biên bản");
        }
        bienBanRepository.deleteById(minutesId);
    }
}
