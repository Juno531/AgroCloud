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
        // Check if super admin already exists
        if (userRepository.findByEmail(superAdminEmail).isPresent()) {
            log.info("Super admin already exists: {}", superAdminEmail);
            return;
        }

        // Check if any super admin exists
        if (userRepository.existsByRole(User.Role.SUPER_ADMIN)) {
            log.info("A super admin account already exists in the system");
            return;
        }

        // Create super admin
        User superAdmin = User.builder()
                .email(superAdminEmail)
                .password(passwordEncoder.encode(superAdminPassword))
                .name(superAdminName)
                .role(User.Role.SUPER_ADMIN)
                .build();

        userRepository.save(superAdmin);
        log.info("✅ Super admin created successfully: {}", superAdminEmail);
        log.warn("⚠️  IMPORTANT: Please change the super admin password immediately!");
    }
}
