package com.farm.erp.core.hr.domain;

import com.farm.erp.core.auth.domain.User;
import com.farm.erp.core.farm.domain.Farm;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "employee_profiles")
@Getter
@NoArgsConstructor
public class EmployeeProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id", nullable = true) // 임시로 null 허용 (기존 데이터 호환)
    private Farm farm;

    @Column(length = 20)
    private String phone;

    @Column(name = "employee_code", unique = true)
    private String employeeCode;

    @Column(name = "hire_date")
    private LocalDate hireDate;

    @Column(name = "bank_account", length = 50)
    private String bankAccount;

    @Column(name = "account_holder", length = 50)
    private String accountHolder;

    @Column(name = "payment_date")
    private Integer paymentDate; // 급여 지급일 (1-31)

    @Column(name = "hourly_wage", precision = 10, scale = 2)
    private BigDecimal hourlyWage; // 시급

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_type")
    private EmploymentType employmentType;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    @Builder
    public EmployeeProfile(User user, Farm farm, String phone, LocalDate hireDate,
            String bankAccount, String accountHolder,
            Integer paymentDate, BigDecimal hourlyWage, String employeeCode, EmploymentType employmentType) {
        this.user = user;
        this.farm = farm;
        this.phone = phone;
        this.hireDate = hireDate;
        this.bankAccount = bankAccount;
        this.accountHolder = accountHolder;
        this.paymentDate = paymentDate;
        this.hourlyWage = hourlyWage;
        this.employeeCode = employeeCode;
        this.employmentType = employmentType;
    }

    public void updateProfile(String phone, LocalDate hireDate, String bankAccount,
            String accountHolder, Integer paymentDate, BigDecimal hourlyWage, EmploymentType employmentType) {
        this.phone = phone;
        this.hireDate = hireDate;
        this.bankAccount = bankAccount;
        this.accountHolder = accountHolder;
        this.paymentDate = paymentDate;
        this.hourlyWage = hourlyWage;
        this.employmentType = employmentType;
    }

    public void unassignFarm() {
        this.farm = null;
    }
}
