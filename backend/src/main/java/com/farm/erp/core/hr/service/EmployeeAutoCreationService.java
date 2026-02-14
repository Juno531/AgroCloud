package com.farm.erp.core.hr.service;

import com.farm.erp.core.auth.domain.User;
import com.farm.erp.core.farm.domain.Farm;
import com.farm.erp.core.hr.domain.EmployeeProfile;
import com.farm.erp.core.hr.repository.EmployeeProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 작업자 회원가입 시 Employee 프로필을 자동으로 생성하는 서비스
 * 별도 트랜잭션으로 처리하여 실패 시에도 회원가입은 성공하도록 함
 */
@Service
@RequiredArgsConstructor
public class EmployeeAutoCreationService {

    private final EmployeeProfileRepository employeeProfileRepository;

    /**
     * Employee 프로필을 생성
     * 같은 트랜잭션 내에서 처리하여 User가 롤백되면 함께 롤백됨 (또는 User 저장 후 바로 조회 가능)
     */
    @Transactional
    public void createEmployeeProfileForNewUser(User user, Farm farm) {
        try {
            // 이미 Employee 프로필이 있는지 확인
            if (employeeProfileRepository.existsByUserId(user.getId())) {
                System.out.println("Employee profile already exists for user: " + user.getId());
                return;
            }

            String code = user.getRole() == User.Role.ADMIN ? user.getAdminCode() : user.getEmployeeCode();

            EmployeeProfile employeeProfile = EmployeeProfile.builder()
                    .user(user)
                    .farm(farm)
                    .phone("") // 사용자가 나중에 입력
                    .hireDate(LocalDate.now()) // 가입일을 입사일로 설정
                    .hourlyWage(new BigDecimal("10000")) // 기본 시급 10,000원
                    .bankAccount("") // 사용자가 나중에 입력
                    .accountHolder(user.getName()) // 사용자 이름을 예금주로
                    .paymentDate(25) // 기본 급여 지급일 25일
                    .employeeCode(code)
                    .build();

            employeeProfileRepository.save(employeeProfile);
            System.out.println("✓ Employee profile created successfully for user: " + user.getEmail() + " in farm: "
                    + farm.getName());
        } catch (Exception e) {
            // Employee 프로필 생성 실패 시 로그만 남기고 회원가입은 계속 진행
            System.err
                    .println("✗ Failed to create employee profile for user " + user.getEmail() + ": " + e.getMessage());
            e.printStackTrace();
        }
    }
}
