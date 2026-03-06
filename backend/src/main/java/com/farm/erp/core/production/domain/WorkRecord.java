package com.farm.erp.core.production.domain;

import com.farm.erp.core.farm.domain.Farm;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Work Record (작업 기록) Entity
 * Records farming work activities for each farm or bed
 */
@Entity
@Table(name = "work_records")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class WorkRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id", nullable = false)
    private Farm farm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bed_id", nullable = true)
    private Bed bed;

    @Column(name = "work_date", nullable = false)
    private LocalDate workDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "keyword_id", nullable = true)
    private WorkKeyword workKeyword;

    @Enumerated(EnumType.STRING)
    @Column(name = "completion_status", length = 20)
    @Builder.Default
    private CompletionStatus completionStatus = CompletionStatus.COMPLETED;

    @Column(name = "regular_worker_count")
    private Integer regularWorkerCount; // 정규/내부 직원 수

    @Column(name = "daily_worker_count")
    private Integer dailyWorkerCount; // 일용직 작업자 수

    @Column(name = "start_time")
    private java.time.LocalTime startTime; // 작업 시작 시간

    @Column(name = "end_time")
    private java.time.LocalTime endTime; // 작업 종료 시간

    @Column(name = "duration_minutes")
    private Integer durationMinutes; // 총 소요 작업 시간 (분)

    @Column(name = "manager", length = 100)
    private String manager; // 작업 관리자 (문자열 기록)

    @Column(columnDefinition = "TEXT")
    private String notes;

    public void updateStatus(CompletionStatus completionStatus) {
        this.completionStatus = completionStatus;
    }

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum CompletionStatus {
        PLANNED("예정"),
        IN_PROGRESS("진행중"),
        COMPLETED("완료");

        private final String koreanName;

        CompletionStatus(String koreanName) {
            this.koreanName = koreanName;
        }

        public String getKoreanName() {
            return koreanName;
        }
    }
}
