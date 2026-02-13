package com.farm.erp.core.production.domain;

import com.farm.erp.core.farm.domain.Farm;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

/**
 * House (하우스/동) Entity
 * Represents a greenhouse unit
 */
@Entity
@Table(name = "houses")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class House {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id", nullable = false)
    private Farm farm;

    @Column(nullable = false, length = 50)
    private String name; // e.g., "House A", "1-Dong"

    @Column(length = 50)
    private String houseType; // Type of greenhouse (e.g., "단동", "연동")

    @Column
    private Double width; // Width in meters

    @Column
    private Double length; // Length in meters

    @Column
    private Double area; // Area in square meters

    @Column(length = 200)
    private String description;

    @Builder.Default
    @Column(name = "is_active")
    private boolean active = true;
}
