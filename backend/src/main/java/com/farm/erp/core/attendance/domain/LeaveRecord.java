package com.farm.erp.core.attendance.domain;

import com.farm.erp.core.auth.domain.User;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "leave_records")
@Getter
@NoArgsConstructor
public class LeaveRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDate leaveDate;

    @Column
    private String reason;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @Builder
    public LeaveRecord(User user, LocalDate leaveDate, String reason) {
        this.user = user;
        this.leaveDate = leaveDate;
        this.reason = reason;
    }
}
