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

        @Transactional
        public AuthResponse login(LoginRequest request) {
                // Check if account is locked due to too many attempts
                if (loginAttemptService.isBlocked(request.getEmail())) {
                        throw new RuntimeException(
                                        "Account temporarily locked due to too many failed login attempts. Please try again later.");
                }

                try {
                        Authentication authentication = authenticationManager.authenticate(
                                        new UsernamePasswordAuthenticationToken(request.getEmail(),
                                                        request.getPassword()));

                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        String jwt = jwtService.createToken(authentication);

                        User user = userRepository.findByEmail(request.getEmail())
                                        .orElseThrow(() -> new RuntimeException("User not found"));

                        // Login succeeded - clear attempt counter
                        loginAttemptService.loginSucceeded(request.getEmail());

                        // Log successful login
                        auditLogService.logLogin(user, "N/A", "N/A");

                        Long farmId = getFarmIdForUser(user);

                        return new AuthResponse(jwt, new UserDto(user, farmId));
                } catch (Exception e) {
                        // Login failed - increment attempt counter
                        loginAttemptService.loginFailed(request.getEmail());
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

                return new AuthResponse(jwt, new UserDto(user, null));
        }

        @Transactional(readOnly = true)
        public UserDto me(String email) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                Long farmId = getFarmIdForUser(user);
                return new UserDto(user, farmId);
        }

        private Long getFarmIdForUser(User user) {
                if (user.getRole() == Role.ADMIN) {
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
}
