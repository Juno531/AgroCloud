package com.farm.erp.core.production.domain;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Nutrient Record (양액 기록) Entity
 * Records nutrient solution data for beds
 */
@Entity
@Table(name = "nutrient_records")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class NutrientRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bed_id", nullable = false)
    private Bed bed;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "planting_id")
    private Planting planting;

    @Column(name = "record_date", nullable = false)
    private LocalDate recordDate;

    // 급액 (Supply) 데이터
    @Column(name = "supply_ec")
    private Double supplyEc; // 급액EC

    @Column(name = "supply_ph")
    private Double supplyPh; // 급액pH

    @Column(name = "supply_amount")
    private Integer supplyAmount; // 급액량 (mL)

    // 배액 (Drain) 데이터
    @Column(name = "drain_ec")
    private Double drainEc; // 배액EC

    @Column(name = "drain_ph")
    private Double drainPh; // 배액pH

    @Column(name = "drain_amount")
    private Integer drainAmount; // 배액량 (mL)

    @Column(name = "drain_rate")
    private Double drainRate; // 배액율 (%)

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Calculate and set drain rate based on supply and drain amounts
     */
    public void calculateDrainRate() {
        if (supplyAmount != null && supplyAmount > 0 && drainAmount != null) {
            this.drainRate = (drainAmount.doubleValue() / supplyAmount.doubleValue()) * 100;
        }
    }
}
