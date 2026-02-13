package com.farm.erp.core.production.domain;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

/**
 * Bed (베드) Entity
 * Represents a cultivation bed within a line
 * Structure: Farm → House → Line → Bed
 */
@Entity
@Table(name = "beds")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Bed {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "line_id", nullable = false)
    private Line line;

    @Column(nullable = false, length = 50)
    private String name; // e.g., "Bed 01", "1번 베드"

    @Column(name = "bed_number", nullable = false)
    private Integer bedNumber; // 베드 번호 (라인 내에서)

    @Column(name = "row_position")
    private Integer rowPosition; // 행 위치 (시각화용)

    @Column(name = "column_position")
    private Integer columnPosition; // 열 위치 (시각화용)

    @Column(name = "length_meters")
    private Double lengthMeters;

    @Column(name = "plant_capacity")
    private Integer plantCapacity; // Max number of plants

    @Builder.Default
    @Column(name = "is_active")
    private boolean active = true;

    @Column(length = 200)
    private String description;
}
