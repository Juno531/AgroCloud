package com.farm.erp.core.production.domain;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

/**
 * Crop (품종/작물) Entity
 * Represents a crop variety (e.g., Seolhyang Strawberry)
 */
@Entity
@Table(name = "crops")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Crop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name; // e.g., "Seolhyang", "Geumsil"

    @Column(length = 50)
    private String variety; // e.g., "Strawberry"

    @Column(length = 200)
    private String scientificName; // Scientific name (e.g., "Fragaria × ananassa")

    @Column(name = "standard_growth_days")
    private Integer standardGrowthDays; // Standard days to harvest

    @Column(name = "growth_duration_days")
    private Integer growthDurationDays; // Estimated days to harvest (deprecated, use standardGrowthDays)

    @Column(length = 500)
    private String description;
}
