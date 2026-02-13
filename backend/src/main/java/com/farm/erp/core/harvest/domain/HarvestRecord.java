package com.farm.erp.core.harvest.domain;

import com.farm.erp.core.production.domain.Bed;
import com.farm.erp.core.production.domain.Crop;
import com.farm.erp.core.production.domain.Season;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Harvest Record Aggregate Root
 * Represents a daily harvest event from a specific bed
 */
@Entity
@Table(name = "harvest_records")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class HarvestRecord {

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

    @Column(name = "harvest_date", nullable = false)
    private LocalDate harvestDate;

    @Column(name = "worker_name")
    private String workerName; // Can be linked to Workforce domain later

    @OneToMany(mappedBy = "harvestRecord", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<HarvestDetail> details = new ArrayList<>();

    @Column(length = 500)
    private String note;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Add harvest detail
     */
    public void addDetail(HarvestDetail detail) {
        this.details.add(detail);
        detail.setHarvestRecord(this);
    }
}
