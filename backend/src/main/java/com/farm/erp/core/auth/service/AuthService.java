package com.farm.erp.core.auth.service;

import com.farm.erp.core.auth.domain.User;
import com.farm.erp.core.auth.domain.User.Role;
import com.farm.erp.core.company.domain.Company;
import com.farm.erp.core.auth.dto.*;
import com.farm.erp.core.auth.repository.UserRepository;
import com.farm.erp.core.auth.security.JwtTokenProvider;
import com.farm.erp.core.farm.domain.Farm;
import com.farm.erp.core.farm.repository.FarmRepository;
import com.farm.erp.core.hr.service.EmployeeAutoCreationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class AuthService {

        @Value("${app.invite-codes.admin}")
        private String adminInviteCode;

        @Value("${app.invite-codes.farm}")
        private String farmInviteCode;

        private final AuthenticationManager authenticationManager;
        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtTokenProvider jwtService;
        private final EmployeeAutoCreationService employeeAutoCreationService;
        private final FarmRepository farmRepository;
        private final LoginAttemptService loginAttemptService;
        private final com.farm.erp.core.audit.service.AuditLogService auditLogService;
        private final com.farm.erp.core.company.service.RegistrationCodeService registrationCodeService;
        private final com.farm.erp.core.auth.repository.RefreshTokenRepository refreshTokenRepository;
        private final EmailService emailService;

        @Transactional
        public AuthResponse login(LoginRequest request) {
                // Check if account is locked due to too many attempts
                if (loginAttemptService.isBlocked(request.getEmail())) {
                        log.warn("Login blocked due to too many failed attempts: {}", request.getEmail());
                        throw new org.springframework.security.authentication.LockedException(
                                        "Account temporarily locked due to too many failed login attempts. Please try again later.");
                }

                try {
                        Authentication authentication = authenticationManager.authenticate(
                                        new UsernamePasswordAuthenticationToken(request.getEmail(),
                                                        request.getPassword()));

                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        String jwt = jwtService.createToken(authentication);
                        String refreshToken = jwtService.createRefreshToken(authentication);

                        User user = userRepository.findByEmail(request.getEmail())
                                        .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException(
                                                        "User not found"));

                        // Save Refresh Token
                        saveRefreshToken(user, refreshToken);

                        // Login succeeded - clear attempt counter
                        loginAttemptService.loginSucceeded(request.getEmail());

                        // Log successful login
                        auditLogService.logLogin(user, "N/A", "N/A");
                        log.info("User logged in successfully: {}", request.getEmail());

                        Long farmId = getFarmIdForUser(user);
                        String employmentType = getEmploymentTypeForUser(user);

                        return new AuthResponse(jwt, refreshToken, new UserDto(user, farmId, employmentType));
                } catch (Exception e) {
                        // Login failed - increment attempt counter
                        loginAttemptService.loginFailed(request.getEmail());
                        log.warn("Login failed for user: {}", request.getEmail());
                        throw e;
                }
        }

        @Transactional
        public AuthResponse register(RegisterRequest request) {
                // 1. 이메일 중복 체크
                if (userRepository.existsByEmail(request.getEmail())) {
                        throw new RuntimeException("Email already in use");
                }

                // 2. 가입 코드 검증
                var registrationCode = registrationCodeService.validateCode(request.getRegistrationCode());
                Company company = registrationCode.getCompany();

                // 3. 역할 결정
                Role role = registrationCode
                                .getType() == com.farm.erp.core.company.domain.RegistrationCode.CodeType.ADMIN
                                                ? Role.ADMIN
                                                : Role.USER;

                // 4. 사용자 생성
                User user = User.builder()
                                .email(request.getEmail())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .name(request.getName())
                                .role(role)
                                .company(company)
                                .build();

                userRepository.save(user);
                log.info("User registered successfully: {}, Role: {}", request.getEmail(), role);

                // 5. 코드 사용 처리 (옵션)
                // registrationCodeService.markCodeAsUsed(request.getRegistrationCode());

                // 6. 인증 토큰 생성
                org.springframework.security.core.userdetails.UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                                user.getEmail(),
                                user.getPassword(),
                                java.util.Collections.singletonList(
                                                new org.springframework.security.core.authority.SimpleGrantedAuthority(
                                                                "ROLE_" + user.getRole().name())));

                Authentication authentication = new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());

                SecurityContextHolder.getContext().setAuthentication(authentication);
                String jwt = jwtService.createToken(authentication);
                String refreshToken = jwtService.createRefreshToken(authentication);

                // Save Refresh Token
                saveRefreshToken(user, refreshToken);

                String employmentType = getEmploymentTypeForUser(user);
                return new AuthResponse(jwt, refreshToken, new UserDto(user, null, employmentType));
        }

        @Transactional
        public AuthResponse refreshToken(String refreshToken) {
                if (!jwtService.validateRefreshToken(refreshToken)) {
                        throw new IllegalArgumentException("Invalid refresh token");
                }

                com.farm.erp.core.auth.domain.RefreshToken token = refreshTokenRepository.findByToken(refreshToken)
                                .orElseThrow(() -> new IllegalArgumentException("Refresh token not found"));

                // Verify expiration (Assuming JwtTokenProvider validation covers date, but
                // double check with entity if needed)
                // if (token.getExpiryDate().isBefore(java.time.Instant.now())) { ... }

                User user = token.getUser();

                // Create new auth object
                org.springframework.security.core.userdetails.UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                                user.getEmail(),
                                user.getPassword(),
                                java.util.Collections.singletonList(
                                                new org.springframework.security.core.authority.SimpleGrantedAuthority(
                                                                "ROLE_" + user.getRole().name())));

                Authentication authentication = new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());

                String newJwt = jwtService.createToken(authentication);
                // Optionally rotate refresh token here

                Long farmId = getFarmIdForUser(user);
                String employmentType = getEmploymentTypeForUser(user);
                return new AuthResponse(newJwt, refreshToken, new UserDto(user, farmId, employmentType));
        }

        @Transactional
        public void logout(String email) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException(
                                                "User not found"));
                refreshTokenRepository.deleteByUser(user);
        }

        @Transactional
        public void logout(User user) {
                refreshTokenRepository.deleteByUser(user);
        }

        private void saveRefreshToken(User user, String token) {
                java.time.Instant expiry = java.time.Instant.now().plusMillis(2592000000L); // 30 days

                refreshTokenRepository.findByUserId(user.getId()).ifPresentOrElse(
                                existingToken -> {
                                        log.info("Updating existing refresh token for user ID: {}", user.getId());
                                        existingToken.updateToken(token, expiry);
                                        refreshTokenRepository.save(existingToken);
                                },
                                () -> {
                                        log.info("Creating new refresh token for user ID: {}", user.getId());
                                        com.farm.erp.core.auth.domain.RefreshToken newRefreshToken = com.farm.erp.core.auth.domain.RefreshToken
                                                        .builder()
                                                        .user(user)
                                                        .token(token)
                                                        .expiryDate(expiry)
                                                        .build();
                                        refreshTokenRepository.save(newRefreshToken);
                                });
        }

        @Transactional(readOnly = true)
        public UserDto me(String email) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException(
                                                "User not found"));
                Long farmId = getFarmIdForUser(user);
                String employmentType = getEmploymentTypeForUser(user);
                return new UserDto(user, farmId, employmentType);
        }

        @Transactional
        public void changePassword(String email, ChangePasswordRequest request) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException(
                                                "User not found"));

                if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                        log.warn("Password change failed: Incorrect current password for user {}", email);
                        throw new org.springframework.security.authentication.BadCredentialsException(
                                        "현재 비밀번호가 일치하지 않습니다.");
                }

                user.updatePassword(passwordEncoder.encode(request.getNewPassword()));
                userRepository.save(user);
                log.info("Password changed successfully for user: {}", email);
        }

        @Transactional(readOnly = true)
        public void verifyPassword(String email, String password) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException(
                                                "User not found"));

                if (!passwordEncoder.matches(password, user.getPassword())) {
                        log.warn("Password verification failed for user {}", email);
                        throw new org.springframework.security.authentication.BadCredentialsException(
                                        "비밀번호가 일치하지 않습니다.");
                }
                log.info("Password verified successfully for user: {}", email);
        }

        @Transactional
        public void sendEmailVerification(String email) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException(
                                                "User not found"));

                // 6자리 난수 생성
                String code = String.format("%06d", new java.util.Random().nextInt(1000000));
                user.setVerificationCode(code, java.time.LocalDateTime.now().plusMinutes(3));
                userRepository.save(user);

                emailService.sendVerificationCode(user.getEmail(), code);
        }

        @Transactional
        public void verifyEmail(String email, String code) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException(
                                                "User not found"));

                if (user.getVerificationCode() == null || !user.getVerificationCode().equals(code)) {
                        throw new RuntimeException("인증 번호가 일치하지 않습니다.");
                }

                if (user.getVerificationCodeExpiresAt().isBefore(java.time.LocalDateTime.now())) {
                        throw new RuntimeException("인증 번호가 만료되었습니다.");
                }

                user.updateEmailVerification(true);
                userRepository.save(user);
                log.info("Email verified successfully for user: {}", email);
        }

        private Long getFarmIdForUser(User user) {
                if (user.getRole() == Role.ADMIN || user.getRole() == Role.MASTER_ADMIN) {
                        return farmRepository.findByUserId(user.getId()).stream()
                                        .findFirst()
                                        .map(Farm::getId)
                                        .orElse(null);
                } else {
                        return employeeAutoCreationService.getEmployeeProfileRepository()
                                        .findByUserId(user.getId())
                                        .map(profile -> profile.getFarm() != null ? profile.getFarm().getId() : null)
                                        .orElse(null);
                }
        }

        private String getEmploymentTypeForUser(User user) {
                if (user.getRole() == Role.USER) {
                        return employeeAutoCreationService.getEmployeeProfileRepository()
                                        .findByUserId(user.getId())
                                        .map(profile -> profile.getEmploymentType() != null
                                                        ? profile.getEmploymentType().name()
                                                        : null)
                                        .orElse(null);
                }
                return null;
        }
}
