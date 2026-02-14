package com.farm.erp.core.hr.service;

import com.farm.erp.api.v1.dto.EmployeeProfileRequest;
import com.farm.erp.api.v1.dto.EmployeeProfileResponse;
import com.farm.erp.core.auth.domain.User;
import com.farm.erp.core.auth.repository.UserRepository;
import com.farm.erp.core.hr.domain.EmployeeProfile;
import com.farm.erp.core.hr.repository.EmployeeProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeProfileRepository employeeProfileRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<EmployeeProfileResponse> getAllEmployees() {
        return employeeProfileRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EmployeeProfileResponse> getEmployeesByFarm(Long farmId) {
        return employeeProfileRepository.findByFarmId(farmId).stream()
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
    public EmployeeProfileResponse createEmployee(EmployeeProfileRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (employeeProfileRepository.existsByUserId(request.getUserId())) {
            throw new RuntimeException("Employee profile already exists for this user");
        }

        EmployeeProfile profile = EmployeeProfile.builder()
                .user(user)
                .phone(request.getPhone())
                .hireDate(request.getHireDate())
                .bankAccount(request.getBankAccount())
                .accountHolder(request.getAccountHolder())
                .paymentDate(request.getPaymentDate())
                .hourlyWage(request.getHourlyWage())
                .build();

        EmployeeProfile saved = employeeProfileRepository.save(profile);
        return toResponse(saved);
    }

    @Transactional
    public EmployeeProfileResponse updateEmployee(Long id, EmployeeProfileRequest request) {
        EmployeeProfile profile = employeeProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee profile not found"));

        profile.updateProfile(
                request.getPhone(),
                request.getHireDate(),
                request.getBankAccount(),
                request.getAccountHolder(),
                request.getPaymentDate(),
                request.getHourlyWage());

        EmployeeProfile updated = employeeProfileRepository.save(profile);
        return toResponse(updated);
    }

    @Transactional
    public void deleteEmployee(Long id) {
        if (!employeeProfileRepository.existsById(id)) {
            throw new RuntimeException("Employee profile not found");
        }
        employeeProfileRepository.deleteById(id);
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
                .accountHolder(profile.getAccountHolder())
                .paymentDate(profile.getPaymentDate())
                .hourlyWage(profile.getHourlyWage())
                .employeeCode(profile.getEmployeeCode())
                .build();
    }
}
