package com.farm.erp.core.auth.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Builder;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String name;

    @Column(name = "admin_code")
    private String adminCode;

    @Column(name = "employee_code")
    private String employeeCode;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Builder
    public User(String email, String password, String name, Role role, String adminCode, String employeeCode) {
        this.email = email;
        this.password = password;
        this.name = name;
        this.role = role;
        this.adminCode = adminCode;
        this.employeeCode = employeeCode;
    }

    public enum Role {
        USER, ADMIN
    }
}
