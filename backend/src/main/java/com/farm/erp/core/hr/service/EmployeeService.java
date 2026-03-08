package com.farm.erp.core.hr.service;

import com.farm.erp.api.v1.dto.EmployeeProfileRequest;
import com.farm.erp.api.v1.dto.EmployeeProfileResponse;
import com.farm.erp.core.auth.domain.User;
import com.farm.erp.core.auth.repository.UserRepository;
import com.farm.erp.core.hr.domain.EmployeeProfile;
import com.farm.erp.core.hr.domain.EmploymentType;
import com.farm.erp.core.hr.dto.EmployeeRegistrationRequest;
import com.farm.erp.core.hr.repository.EmployeeProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeService {

        private final EmployeeProfileRepository employeeProfileRepository;
        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final com.farm.erp.core.attendance.repository.AttendanceRepository attendanceRepository;
        private final com.farm.erp.core.attendance.repository.LeaveRepository leaveRepository;
        private final com.farm.erp.core.board.repository.BoardRepository boardRepository;
        private final com.farm.erp.core.auth.repository.RefreshTokenRepository refreshTokenRepository;

        @Transactional(readOnly = true)
        public List<EmployeeProfileResponse> getAllEmployees() {
                return employeeProfileRepository.findAll().stream()
                                .filter(profile -> profile.getUser().getRole() != User.Role.MASTER_ADMIN)
                                .map(this::toResponse)
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public List<EmployeeProfileResponse> getEmployeesByFarm(Long farmId) {
                return employeeProfileRepository.findByFarmId(farmId).stream()
                                .filter(profile -> profile.getUser().getRole() != User.Role.MASTER_ADMIN)
                                .map(this::toResponse)
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public List<EmployeeProfileResponse> getEmployeesByCompanyCode(String companyCode) {
                return employeeProfileRepository.findByUserCompanyCode(companyCode).stream()
                                .filter(profile -> profile.getUser().getRole() != User.Role.MASTER_ADMIN)
                                .map(this::toResponse)
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public EmployeeProfileResponse getEmployee(Long id) {
                EmployeeProfile profile = employeeProfileRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Employee profile not found"));
                return toResponse(profile);
        }

        @Transactional(readOnly = true)
        public EmployeeProfileResponse getEmployeeByUserId(Long userId) {
                EmployeeProfile profile = employeeProfileRepository.findByUserId(userId)
                                .orElseThrow(() -> new RuntimeException("Employee profile not found for user"));
                return toResponse(profile);
        }

        @Transactional
        public EmployeeProfileResponse registerEmployee(EmployeeRegistrationRequest request, User adminUser) {
                if (userRepository.existsByEmail(request.getEmail())) {
                        throw new IllegalArgumentException("Email already exists");
                }

                User newUser = User.builder()
                                .name(request.getName())
                                .email(request.getEmail())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .role(request.getRole() != null ? request.getRole() : User.Role.USER)
                                .company(adminUser.getCompany())
                                .build();

                User savedUser = userRepository.save(newUser);

                EmployeeProfile profile = EmployeeProfile.builder()
                                .user(savedUser)
                                .phone(request.getPhoneNumber())
                                .hireDate(request.getHireDate())
                                .bankAccount(request.getBankAccount())
                                .bankName(request.getBankName()) // 추가
                                .accountHolder(request.getAccountHolder())
                                .address(request.getAddress()) // 추가
                                .paymentDate(request.getPaymentDate())
                                .hourlyWage(
                                                java.math.BigDecimal.valueOf(request.getHourlyWage() != null
                                                                ? request.getHourlyWage()
                                                                : 0L))
                                .employmentType(
                                                request.getEmploymentType() != null ? request.getEmploymentType()
                                                                : EmploymentType.FULL_TIME)
                                .build();

                EmployeeProfile savedProfile = employeeProfileRepository.save(profile);
                return toResponse(savedProfile);
        }

        @Transactional
        public EmployeeProfileResponse updateEmployee(Long id, EmployeeProfileRequest request) {
                EmployeeProfile profile = employeeProfileRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Employee profile not found"));

                profile.updateProfile(
                                request.getPhone(),
                                request.getHireDate(),
                                request.getBankAccount(),
                                request.getBankName(), // 추가
                                request.getAccountHolder(),
                                request.getAddress(), // 추가
                                request.getPaymentDate(),
                                request.getHourlyWage(),
                                request.getEmploymentType());

                if (request.getName() != null && !request.getName().trim().isEmpty()) {
                        profile.getUser().updateName(request.getName());
                }

                EmployeeProfile updated = employeeProfileRepository.save(profile);
                return toResponse(updated);
        }

        @Transactional
        public void deleteEmployee(Long id) {
                EmployeeProfile profile = employeeProfileRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Employee profile not found"));

                User user = profile.getUser();
                Long userId = user.getId();

                // 1. 연관 데이터 선제 삭제 (외래 키 제약 해결)
                attendanceRepository.deleteByUserId(userId);
                leaveRepository.deleteByUserId(userId);
                boardRepository.deleteByAuthorId(userId);
                refreshTokenRepository.deleteByUser(user);

                // 2. 프로필 및 사용자 삭제
                employeeProfileRepository.delete(profile);
                userRepository.delete(user);
        }

        private EmployeeProfileResponse toResponse(EmployeeProfile profile) {
                return EmployeeProfileResponse.builder()
                                .id(profile.getId())
                                .userId(profile.getUser().getId())
                                .name(profile.getUser().getName())
                                .email(profile.getUser().getEmail())
                                .phone(profile.getPhone())
                                .hireDate(profile.getHireDate())
                                .bankAccount(profile.getBankAccount())
                                .bankName(profile.getBankName()) // 추가
                                .accountHolder(profile.getAccountHolder())
                                .address(profile.getAddress()) // 추가
                                .paymentDate(profile.getPaymentDate())
                                .hourlyWage(profile.getHourlyWage())
                                .employeeCode(profile.getEmployeeCode())
                                .employmentType(profile.getEmploymentType())
                                .password(profile.getUser().getPassword())
                                .role(profile.getUser().getRole().name())
                                .build();
        }
}
