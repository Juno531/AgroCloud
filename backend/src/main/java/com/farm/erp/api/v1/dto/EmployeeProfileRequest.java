package com.farm.erp.api.v1.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class EmployeeProfileRequest {
    private Long userId;
    private String phone;
    private LocalDate hireDate;
    private String bankAccount;
    private String accountHolder;
    private Integer paymentDate;
    private BigDecimal hourlyWage;
}
