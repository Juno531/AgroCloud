package com.farm.erp.core.company.domain;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "registration_codes")
@Getter
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class RegistrationCode {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(nullable = false, unique = true)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CodeType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CodeStatus status;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public RegistrationCode(Company company, String code, CodeType type, LocalDateTime expiresAt) {
        this.company = company;
        this.code = code;
        this.type = type;
        this.expiresAt = expiresAt;
        this.status = CodeStatus.ACTIVE;
    }

    public void use() {
        this.status = CodeStatus.USED;
    }

    public void expire() {
        this.status = CodeStatus.EXPIRED;
    }

    public boolean isValid() {
        if (this.status != CodeStatus.ACTIVE) {
            return false;
        }
        if (this.expiresAt != null && LocalDateTime.now().isAfter(this.expiresAt)) {
            return false;
        }
        return true;
    }

    public enum CodeType {
        ADMIN,      // 회사 관리자
        EMPLOYEE    // 일반 직원
    }

    public enum CodeStatus {
        ACTIVE,
        USED,
        EXPIRED
    }
}
