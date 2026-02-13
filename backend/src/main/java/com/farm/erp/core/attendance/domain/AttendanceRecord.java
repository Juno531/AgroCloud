package com.farm.erp.core.attendance.domain;

import com.farm.erp.core.auth.domain.User;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "attendance_records")
@Getter
@NoArgsConstructor
public class AttendanceRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttendanceType type;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false)
    private Long farmId;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @Builder
    public AttendanceRecord(User user, AttendanceType type, LocalDateTime timestamp, Long farmId) {
        this.user = user;
        this.type = type;
        this.timestamp = timestamp;
        this.farmId = farmId;
    }

    public enum AttendanceType {
        CLOCK_IN, CLOCK_OUT
    }
}
