package com.farm.erp.core.production.domain;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Work Record (작업 기록) Entity
 * Records farming work activities for each bed
 */
@Entity
@Table(name = "work_records")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class WorkRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bed_id", nullable = false)
    private Bed bed;

    @Column(name = "work_date", nullable = false)
    private LocalDate workDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "work_type", nullable = false, length = 50)
    private WorkType workType;

    @Enumerated(EnumType.STRING)
    @Column(name = "completion_status", length = 20)
    @Builder.Default
    private CompletionStatus completionStatus = CompletionStatus.COMPLETED;

    @Column(name = "worker_count")
    private Integer workerCount;

    @Column(name = "duration_minutes")
    private Integer durationMinutes; // 작업 시간 (분)

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum WorkType {
        LEAF_REMOVAL("적엽"),
        FLOWER_THINNING("적화"),
        FRUIT_THINNING("적과"),
        RUNNER_REMOVAL("런너 제거"),
        POLLINATION("수정 작업"),
        WATERING("관수"),
        FERTILIZING("시비"),
        PRUNING("정지 작업"),
        HARVESTING("수확"),
        OTHER("기타");

        private final String koreanName;

        WorkType(String koreanName) {
            this.koreanName = koreanName;
        }

        public String getKoreanName() {
            return koreanName;
        }
    }

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
