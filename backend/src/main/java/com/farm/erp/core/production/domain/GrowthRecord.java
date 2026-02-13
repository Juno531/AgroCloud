package com.farm.erp.core.production.domain;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Growth Record (생육 기록) Entity
 * Records growth measurements for plantings
 */
@Entity
@Table(name = "growth_records")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class GrowthRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "planting_id", nullable = false)
    private Planting planting;

    @Column(name = "record_date", nullable = false)
    private LocalDate recordDate;

    // 생육 데이터 필드
    @Column(name = "plant_height_cm")
    private Double plantHeightCm; // 초장 (cm)

    @Column(name = "leaf_length_cm")
    private Double leafLengthCm; // 엽장 (cm)

    @Column(name = "leaf_width_cm")
    private Double leafWidthCm; // 엽폭 (cm)

    @Column(name = "leaf_count")
    private Integer leafCount; // 엽수

    @Column(name = "crown_diameter_mm")
    private Double crownDiameterMm; // 관부 직경 (mm)

    @Column(name = "flower_cluster_count")
    private Integer flowerClusterCount; // 화방수

    // 기타 관찰 데이터
    @Column(name = "flowering_date")
    private LocalDate floweringDate;

    @Column(name = "fruiting_date")
    private LocalDate fruitingDate;

    @Column(name = "fruit_count")
    private Integer fruitCount;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
