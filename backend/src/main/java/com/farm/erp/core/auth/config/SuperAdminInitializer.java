package com.farm.erp.core.auth.config;

import com.farm.erp.core.auth.domain.User;
import com.farm.erp.core.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class SuperAdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.super-admin.email}")
    private String superAdminEmail;

    @Value("${app.super-admin.password}")
    private String superAdminPassword;

    @Value("${app.super-admin.name}")
    private String superAdminName;

    @Override
    public void run(String... args) {
        if (superAdminEmail == null || superAdminEmail.trim().isEmpty()) {
            log.warn("⚠️ Super admin email is not configured. Skipping initialization.");
            return;
        }

        final String actualPassword;
        final boolean isRandomPassword;

        if (superAdminPassword == null || superAdminPassword.trim().isEmpty()) {
            actualPassword = generateRandomPassword();
            isRandomPassword = true;
        } else {
            actualPassword = superAdminPassword;
            isRandomPassword = false;
        }

        try {
            userRepository.findByEmail(superAdminEmail).ifPresentOrElse(
                    existingAdmin -> {
                        // 이미 계정이 존재하면 비밀번호만 업데이트 (랜덤 비밀번호인 경우 혹은 변경을 원할 경우)
                        if (isRandomPassword) {
                            existingAdmin.updatePassword(passwordEncoder.encode(actualPassword));
                            userRepository.save(existingAdmin);
                            log.info("✅ Super admin password has been reset with a generated password.");
                            log.warn("🚨 ======================================================= 🚨");
                            log.warn("🚨 1회성 Super Admin 비밀번호가 생성되었습니다: [{}] 🚨", actualPassword);
                            log.warn("🚨 ======================================================= 🚨");
                        } else {
                            log.info("Super admin already exists: {}", superAdminEmail);
                        }
                    },
                    () -> {
                        // Check if any super admin exists globally
                        if (userRepository.existsByRole(User.Role.SUPER_ADMIN)) {
                            log.info("A super admin account already exists in the system with a different email.");
                            return;
                        }

                        // Create super admin
                        User superAdmin = User.builder()
                                .email(superAdminEmail)
                                .password(passwordEncoder.encode(actualPassword))
                                .name(superAdminName)
                                .role(User.Role.SUPER_ADMIN)
                                .build();

                        userRepository.save(superAdmin);
                        log.info("✅ Super admin created successfully: {}", superAdminEmail);

                        if (isRandomPassword) {
                            log.warn("🚨 ======================================================= 🚨");
                            log.warn("🚨 1회성 Super Admin 비밀번호가 생성되었습니다: [{}] 🚨", actualPassword);
                            log.warn("🚨 ======================================================= 🚨");
                        } else {
                            log.warn("⚠️ IMPORTANT: Please change the super admin password immediately!");
                        }
                    });
        } catch (Exception e) {
            log.error("❌ Failed to initialize super admin: {}", e.getMessage());
        }
    }

    private String generateRandomPassword() {
        int length = 12;
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
        java.security.SecureRandom random = new java.security.SecureRandom();
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
}
