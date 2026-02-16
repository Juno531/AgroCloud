package com.farm.erp.core.audit.domain;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs", indexes = {
    @Index(name = "idx_audit_timestamp", columnList = "timestamp"),
    @Index(name = "idx_audit_user", columnList = "userId"),
    @Index(name = "idx_audit_entity", columnList = "entityType, entityId")
})
@Getter
@NoArgsConstructor
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String userEmail;

    @Column(nullable = false)
    private String userName;

    @Column(nullable = false)
    private String action; // CREATE, UPDATE, DELETE, LOGIN, LOGOUT

    @Column(nullable = false)
    private String entityType; // Farm, Employee, User, etc.

    private Long entityId;

    @Column(columnDefinition = "TEXT")
    private String oldValue; // JSON format

    @Column(columnDefinition = "TEXT")
    private String newValue; // JSON format

    private String ipAddress;

    private String userAgent;

    @Builder
    public AuditLog(Long userId, String userEmail, String userName, String action,
                    String entityType, Long entityId, String oldValue, String newValue,
                    String ipAddress, String userAgent) {
        this.timestamp = LocalDateTime.now();
        this.userId = userId;
        this.userEmail = userEmail;
        this.userName = userName;
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.oldValue = oldValue;
        this.newValue = newValue;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
    }
}
