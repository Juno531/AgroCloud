package com.farm.erp.api.v1.dto;

import com.farm.erp.core.hr.domain.EmploymentType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Builder
public class EmployeeProfileResponse {
    private Long id;
    private Long userId;
    private String name;
    private String email;
    private String phone;
    private LocalDate hireDate;
    private String bankAccount;
    private String accountHolder;
    private Integer paymentDate;
    private BigDecimal hourlyWage;
    private String employeeCode;
    private String password;
    private String role; // Add role field to send to frontend
    private EmploymentType employmentType; // 정규직/비정규직(알바)
}
