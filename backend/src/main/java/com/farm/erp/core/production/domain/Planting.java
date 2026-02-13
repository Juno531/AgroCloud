package com.farm.erp.core.production.domain;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Planting (정식) Entity
 * Represents the planting of a crop in a specific bed for a season
 */
@Entity
@Table(name = "plantings")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Planting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "season_id", nullable = false)
    private Season season;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bed_id", nullable = false)
    private Bed bed;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "crop_id", nullable = false)
    private Crop crop;

    @Column(name = "planting_date", nullable = false)
    private LocalDate plantingDate;

    @Column(name = "plant_count")
    private Integer plantCount;

    @Column(name = "expected_harvest_date")
    private LocalDate expectedHarvestDate;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private PlantingStatus status = PlantingStatus.ACTIVE;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Planting status enumeration
     */
    public enum PlantingStatus {
        ACTIVE, // Currently growing
        COMPLETED, // Harvested
        REMOVED // Removed before completion
    }
}
