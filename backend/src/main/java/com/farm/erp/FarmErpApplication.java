package com.farm.erp;

import java.util.TimeZone;
import jakarta.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Farm ERP Backend Application
 * Enterprise Resource Planning System for Farm Management
 * 
 * Architecture: Hexagonal Architecture + DDD
 */
@SpringBootApplication
@EnableJpaAuditing
@EnableCaching
@EnableAsync
@EnableScheduling
public class FarmErpApplication {

    public static void main(String[] args) {
        SpringApplication.run(FarmErpApplication.class, args);
    }

    @PostConstruct
    public void init() {
        // 시스템 전체 타임존을 한국 시간으로 설정
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Seoul"));
    }

}
