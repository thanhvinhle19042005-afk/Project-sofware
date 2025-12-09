package com.example.hokhau.model;// src/main/java/com/example/hokhau/model/HoKhau.java
import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity // Đánh dấu đây là một Entity (tương đương với một bảng trong DB)
public class HoKhau {

    @Id // Đánh dấu là khóa chính
    private int id;

    private String tenChuHo;
    private String diaChi;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getTenChuHo() {
        return tenChuHo;
    }

    public void setTenChuHo(String tenChuHo) {
        this.tenChuHo = tenChuHo;
    }

    public String getDiaChi() {
        return diaChi;
    }

    public void setDiaChi(String diaChi) {
        this.diaChi = diaChi;
    }
}