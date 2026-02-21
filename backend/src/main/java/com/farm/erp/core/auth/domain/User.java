package com.farm.erp.core.auth.domain;

import com.farm.erp.core.company.domain.Company;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;

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

    @ManyToOne(fetch = FetchType.LAZY) // Changed from EAGER to LAZY
    @JoinColumn(name = "company_code", referencedColumnName = "code")
    private Company company;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Builder
    public User(String email, String password, String name, Role role, Company company) {
        this.email = email;
        this.password = password;
        this.name = name;
        this.role = role;
        this.company = company;
    }

    public void updatePassword(String encodedPassword) {
        this.password = encodedPassword;
    }

    public void updateName(String name) {
        this.name = name;
    }

    public enum Role {
        USER, // 일반 작업자
        ADMIN, // 농장 관리자
        SUPER_ADMIN // 시스템 전체 관리자
    }
}
