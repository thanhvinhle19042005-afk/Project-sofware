package com.quanlytodanpho;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class QuanLyToDanPhoApplication {
    public static void main(String[] args) {
        SpringApplication.run(QuanLyToDanPhoApplication.class, args);
    }
}
