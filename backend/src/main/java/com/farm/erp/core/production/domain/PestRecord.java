package com.farm.erp.core.production.domain;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Pest Record (병해충 기록) Entity
 * Records pest and disease occurrences and treatments
 */
@Entity
@Table(name = "pest_records")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class PestRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bed_id", nullable = false)
    private Bed bed;

    @Column(name = "record_date", nullable = false)
    private LocalDate recordDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "pest_type", nullable = false, length = 50)
    private PestType pestType;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Severity severity;

    // 농약 정보
    @Column(name = "pesticide_name", length = 100)
    private String pesticideName; // 농약명

    @Column(name = "application_method", length = 100)
    private String applicationMethod; // 처리 방법 (예: 살포, 관주)

    @Column(name = "affected_bed_range_start")
    private Integer affectedBedRangeStart; // 시작 베드 번호

    @Column(name = "affected_bed_range_end")
    private Integer affectedBedRangeEnd; // 종료 베드 번호

    @Column(columnDefinition = "TEXT")
    private String treatment; // 처리 내용

    @Column(name = "treatment_date")
    private LocalDate treatmentDate;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum PestType {
        POWDERY_MILDEW("흰가루병"),
        GRAY_MOLD("잿빛곰팡이"),
        SPIDER_MITE("응애"),
        APHID("진딧물"),
        THRIPS("총채벌레"),
        ANTHRACNOSE("탄저병"),
        ROOT_ROT("역병"),
        OTHER("기타");

        private final String koreanName;

        PestType(String koreanName) {
            this.koreanName = koreanName;
        }

        public String getKoreanName() {
            return koreanName;
        }
    }

    public enum Severity {
        LOW("낮음"),
        MEDIUM("보통"),
        HIGH("높음"),
        CRITICAL("심각");

        private final String koreanName;

        Severity(String koreanName) {
            this.koreanName = koreanName;
        }

        public String getKoreanName() {
            return koreanName;
        }
    }
}
