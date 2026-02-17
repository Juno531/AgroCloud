package com.farm.erp.core.hr.dto;

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
    private String name;
    private String email;
    private String password;
    private String phoneNumber;

    // Profile info
    private LocalDate hireDate;
    private Long hourlyWage;
    private String bankAccount;
    private String accountHolder;
    private Integer paymentDate;
}
