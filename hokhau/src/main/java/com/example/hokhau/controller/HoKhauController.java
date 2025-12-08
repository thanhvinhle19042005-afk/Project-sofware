// src/main/java/com/example/hokhau/controller/HoKhauController.java
package com.example.hokhau.controller;
import com.example.hokhau.model.HoKhau;
import com.example.hokhau.repository.HoKhauRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/hokhau")
public class HoKhauController {

    // Dependency Injection: Spring tự động khởi tạo và gán Repository vào đây
    @Autowired
    private HoKhauRepository hoKhauRepository;

    // --- CHỨC NĂNG READ (Xem Danh Sách) ---
    @GetMapping("/danhsach")
    public String hienThiDanhSach(Model model) {
        // Lấy tất cả hộ khẩu từ DB (tương đương SELECT * FROM HoKhau)
        model.addAttribute("danhSachHoKhau", hoKhauRepository.findAll());
        // Trả về tên file HTML (sẽ tạo ở bước 3)
        return "danhsach-hokhau";
    }

    // --- CHỨC NĂNG CREATE (Thêm Mới) ---
    @GetMapping("/them") // 1. Hiển thị form
    public String hienThiFormThem(Model model) {
        // Gửi một đối tượng HoKhau rỗng để Thymeleaf ánh xạ dữ liệu form vào
        model.addAttribute("hoKhau", new HoKhau());
        return "form-hokhau";
    }

    @PostMapping("/them") // 2. Xử lý dữ liệu form
    public String xuLyThemHoKhau(@ModelAttribute HoKhau hoKhau) {
        // Tương đương với SQL INSERT INTO...
        if (!hoKhauRepository.existsById(hoKhau.getId())){
            hoKhauRepository.save(hoKhau);
        }
        // Chuyển hướng về trang danh sách
        return "redirect:/hokhau/danhsach";
    }

    // --- CHỨC NĂNG DELETE (Bớt/Xóa) ---
    // @PathVariable lấy ID từ URL (ví dụ: /hokhau/xoa/10)
    @GetMapping("/xoa/{id}")
    public String xuLyXoaHoKhau(@PathVariable("id") Integer id) {
        // Tương đương với SQL DELETE FROM HoKhau WHERE id = ?
        hoKhauRepository.deleteById(id);
        return "redirect:/hokhau/danhsach";
    }
}