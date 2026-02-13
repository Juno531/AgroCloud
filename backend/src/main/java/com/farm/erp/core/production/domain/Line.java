package com.farm.erp.core.production.domain;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

/**
 * Line (라인) Entity
 * Represents a cultivation line within a house
 * Structure: Farm → House → Line → Bed
 */
@Entity
@Table(name = "lines")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Line {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "house_id", nullable = false)
    private House house;

    @Column(nullable = false, length = 50)
    private String name; // e.g., "Line 1", "A라인"

    @Column(name = "line_number", nullable = false)
    private Integer lineNumber; // 라인 번호 (정렬용)

    @Column(name = "bed_count")
    private Integer bedCount; // 이 라인의 베드 개수

    @Column(name = "length_meters")
    private Double lengthMeters; // 라인 길이 (m)

    @Builder.Default
    @Column(name = "is_active")
    private boolean active = true;

    @Column(length = 200)
    private String description;
}
