package com.farm.erp.core.auth.service;

import com.farm.erp.core.auth.domain.User;
import com.farm.erp.core.auth.domain.User.Role;
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
        private final JwtTokenProvider tokenProvider;
        private final EmployeeAutoCreationService employeeAutoCreationService;
        private final FarmRepository farmRepository;

        @Transactional
        public AuthResponse login(LoginRequest request) {
                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

                SecurityContextHolder.getContext().setAuthentication(authentication);
                String jwt = tokenProvider.createToken(authentication);

                User user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                return new AuthResponse(jwt, new UserDto(user));
        }

        @Transactional
        public AuthResponse register(RegisterRequest request) {
                // 1. 이메일 중복 체크
                if (userRepository.existsByEmail(request.getEmail())) {
                        throw new RuntimeException("Email already in use");
                }

                // 2. 초대 코드 검증 및 역할 결정
                Role userRole;
                if ("admin".equalsIgnoreCase(request.getRegisterType())) {
                        if (!adminInviteCode.equals(request.getInviteCode())) {
                                throw new RuntimeException("Invalid admin invite code");
                        }
                        userRole = Role.ADMIN;
                } else if ("worker".equalsIgnoreCase(request.getRegisterType())) {
                        // 작업자는 farmInviteCode(농장 ID)로만 검증
                        userRole = Role.USER;
                } else {
                        throw new RuntimeException("Invalid register type");
                }

                // 3. 사용자 생성
                User user = User.builder()
                                .email(request.getEmail())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .name(request.getName())
                                .role(userRole)
                                .build();

                User savedUser = userRepository.save(user);

                // 4. 인증 토큰 생성
                org.springframework.security.core.userdetails.User userDetails = new org.springframework.security.core.userdetails.User(
                                savedUser.getEmail(),
                                savedUser.getPassword(),
                                java.util.Collections.singletonList(
                                                new org.springframework.security.core.authority.SimpleGrantedAuthority(
                                                                "ROLE_" + savedUser.getRole().name())));

                Authentication authentication = new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());

                SecurityContextHolder.getContext().setAuthentication(authentication);
                String jwt = tokenProvider.createToken(authentication);

                // 6. USER 역할인 경우 자동으로 Employee 프로필 생성 (별도 트랜잭션)
                if (userRole == Role.USER) {
                        // 농장 초대 코드 (임시: farm ID 사용)로 Farm 조회
                        if (request.getFarmInviteCode() == null || request.getFarmInviteCode().isBlank()) {
                                throw new RuntimeException("작업자 가입 시 농장 초대 코드가 필요합니다");
                        }

                        Long farmId;
                        try {
                                farmId = Long.parseLong(request.getFarmInviteCode());
                        } catch (NumberFormatException e) {
                                throw new RuntimeException("유효하지 않은 농장 초대 코드입니다");
                        }

                        Farm farm = farmRepository.findById(farmId)
                                        .orElseThrow(() -> new RuntimeException("유효하지 않은 농장 초대 코드입니다"));

                        // 별도 서비스를 통해 Employee 프로필 생성
                        employeeAutoCreationService.createEmployeeProfileForNewUser(savedUser, farm);
                }

                return new AuthResponse(jwt, new UserDto(savedUser));
        }
}
