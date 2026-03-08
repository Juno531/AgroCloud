package com.farm.erp.core.hr.dto;

import com.farm.erp.core.hr.domain.EmploymentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeRegistrationRequest {
    // User info
    @jakarta.validation.constraints.NotBlank(message = "Name is required")
    private String name;

    @jakarta.validation.constraints.NotBlank(message = "Email is required")
    @jakarta.validation.constraints.Email(message = "Invalid email format")
    private String email;

    @jakarta.validation.constraints.NotBlank(message = "Password is required")
    private String password;

    private String phoneNumber;

    // Profile info
    private LocalDate hireDate;
    private Long hourlyWage;
    private String bankAccount;
    private String bankName; // 추가: 은행명
    private String accountHolder;
    private Integer paymentDate;
    private String address; // 추가: 거주지

    @jakarta.validation.constraints.NotNull(message = "Employment type is required")
    private EmploymentType employmentType; // 정규직/비정규직(알바)

    private com.farm.erp.core.auth.domain.User.Role role;
}
