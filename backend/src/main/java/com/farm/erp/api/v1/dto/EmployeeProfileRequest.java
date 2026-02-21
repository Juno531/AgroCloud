package com.farm.erp.api.v1.dto;

import com.farm.erp.core.hr.domain.EmploymentType;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class EmployeeProfileRequest {
    private Long userId;
    private String name;
    private String phone;
    private LocalDate hireDate;
    private String bankAccount;
    private String accountHolder;
    private Integer paymentDate;
    private BigDecimal hourlyWage;
    @jakarta.validation.constraints.NotNull(message = "Employment type is required")
    private EmploymentType employmentType; // 정규직/비정규직(알바)
}
