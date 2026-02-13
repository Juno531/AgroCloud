package com.farm.erp.api.v1.dto;

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
}
