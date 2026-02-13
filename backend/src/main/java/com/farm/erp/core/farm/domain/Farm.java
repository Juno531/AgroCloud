package com.farm.erp.core.farm.domain;

import com.farm.erp.core.auth.domain.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Farm Aggregate Root
 * Represents a farm entity in the system
 */
@Entity
@Table(name = "farms")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Farm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 200)
    private String location;

    @Column(precision = 10, scale = 2)
    private BigDecimal area; // in hectares

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private FarmStatus status = FarmStatus.ACTIVE;

    @Column(length = 500)
    private String description;

    @Column(name = "owner_name", length = 100)
    private String ownerName;

    @Column(name = "contact_number", length = 20)
    private String contactNumber;

    // 사용자별 농장 데이터 분리를 위한 userId 추가
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Business logic: Update farm information
     */
    public void update(String name, String location, BigDecimal area, String description,
            String ownerName, String contactNumber) {
        if (name != null)
            this.name = name;
        if (location != null)
            this.location = location;
        if (area != null)
            this.area = area;
        if (description != null)
            this.description = description;
        if (ownerName != null)
            this.ownerName = ownerName;
        if (contactNumber != null)
            this.contactNumber = contactNumber;
    }

    /**
     * Business logic: Activate farm
     */
    public void activate() {
        this.status = FarmStatus.ACTIVE;
    }

    /**
     * Business logic: Deactivate farm
     */
    public void deactivate() {
        this.status = FarmStatus.INACTIVE;
    }
}
