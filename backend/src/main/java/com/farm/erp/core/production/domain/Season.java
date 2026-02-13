package com.farm.erp.core.production.domain;

import com.farm.erp.core.farm.domain.Farm;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Season (작기) Aggregate Root
 * Represents a cultivation season (e.g., 2024-2025 Strawberry Season)
 */
@Entity
@Table(name = "seasons")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Season {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id", nullable = false)
    private Farm farm;

    @Column(nullable = false, length = 100)
    private String name; // e.g., "2024 Winter Strawberry"

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private SeasonStatus status = SeasonStatus.PLANNED;

    @Column(length = 500)
    private String description;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Start the season
     */
    public void start() {
        this.status = SeasonStatus.IN_PROGRESS;
        if (this.startDate == null) {
            this.startDate = LocalDate.now();
        }
    }

    /**
     * End the season
     */
    public void end() {
        this.status = SeasonStatus.COMPLETED;
        if (this.endDate == null) {
            this.endDate = LocalDate.now();
        }
    }

    /**
     * Update season status
     */
    public void updateStatus(SeasonStatus newStatus) {
        this.status = newStatus;
        if (newStatus == SeasonStatus.ACTIVE || newStatus == SeasonStatus.IN_PROGRESS) {
            if (this.startDate == null) {
                this.startDate = LocalDate.now();
            }
        } else if (newStatus == SeasonStatus.COMPLETED) {
            if (this.endDate == null) {
                this.endDate = LocalDate.now();
            }
        }
    }
}
