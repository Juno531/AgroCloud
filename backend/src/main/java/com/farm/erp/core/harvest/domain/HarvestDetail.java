package com.farm.erp.core.harvest.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Harvest Detail Entity
 * Breakdown of harvest by grade
 */
@Entity
@Table(name = "harvest_details")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class HarvestDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "harvest_record_id", nullable = false)
    @Setter
    private HarvestRecord harvestRecord;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private HarvestGrade grade;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal weightKg;

    @Column(name = "box_count")
    private Integer boxCount;
}
