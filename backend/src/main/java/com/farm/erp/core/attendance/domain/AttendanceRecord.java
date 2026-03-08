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

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttendanceType type;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false)
    private Long farmId;

    @Column
    private String companyCode;

    @Column
    private Integer weekNumber;

    @Column
    private Integer workingDayIndex;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecordStatus status = RecordStatus.NORMAL;

    @Column(length = 500)
    private String reason;

    @Column(length = 500)
    private String remarks;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @Builder
    public AttendanceRecord(User user, AttendanceType type, LocalDateTime timestamp, Long farmId, String companyCode,
            Integer weekNumber, Integer workingDayIndex, RecordStatus status, String reason, String remarks) {
        this.user = user;
        this.type = type;
        this.timestamp = timestamp;
        this.farmId = farmId;
        this.companyCode = companyCode;
        this.weekNumber = weekNumber;
        this.workingDayIndex = workingDayIndex;
        this.status = status != null ? status : RecordStatus.NORMAL;
        this.reason = reason;
        this.remarks = remarks;
    }

    public void updateTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public void updateStatus(RecordStatus status) {
        this.status = status;
    }

    public void updateReason(String reason) {
        this.reason = reason;
    }

    public void updateRemarks(String remarks) {
        this.remarks = remarks;
    }

    public enum AttendanceType {
        CLOCK_IN, CLOCK_OUT
    }

    public enum RecordStatus {
        NORMAL, PENDING, APPROVED, REJECTED,
        PRESENT, LATE, ABSENT, LEAVE, CLOCK_OUT
    }
}
