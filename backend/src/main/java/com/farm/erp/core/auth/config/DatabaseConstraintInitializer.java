package com.farm.erp.core.auth.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * 데이터베이스 제약 조건을 초기화하는 컴포넌트입니다.
 * 특히 'users_role_check' 제약 조건을 최신 상태로 유지합니다.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseConstraintInitializer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        try {
            log.info("Checking and updating database constraints...");

            // 기존 제약 조건 삭제 후 MASTER_ADMIN이 포함된 새로운 제약 조건 추가
            // PostgreSQL 네이티브 SQL 사용
            jdbcTemplate.execute("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");
            jdbcTemplate.execute(
                    "ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('USER', 'ADMIN', 'MASTER_ADMIN', 'SUPER_ADMIN'))");

            log.info("Database constraints updated successfully.");
        } catch (Exception e) {
            log.error("Failed to update database constraints: {}", e.getMessage());
            // 제약 조건 업데이트 실패 시에도 애플리케이션은 계속 실행될 수 있도록 예외를 삼킵니다.
            // (예: H2 인메모리 DB 사용 시 등)
        }
    }
}
