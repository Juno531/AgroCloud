package com.farm.erp.core.production.dto;

import com.farm.erp.core.production.domain.NutrientRecord;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NutrientRecordResponse {

    private Long id;
    private Long bedId;
    private String bedName;
    private String lineName;
    private String houseName;
    private Long plantingId;
    private String cropName;
    private LocalDate recordDate;
    private Double supplyEc;
    private Double supplyPh;
    private Integer supplyAmount;
    private Double drainEc;
    private Double drainPh;
    private Integer drainAmount;
    private Double drainRate;
    private String notes;
    private LocalDateTime createdAt;

    public static NutrientRecordResponse from(NutrientRecord record) {
        return NutrientRecordResponse.builder()
                .id(record.getId())
                .bedId(record.getBed().getId())
                .bedName(record.getBed().getName())
                .lineName(record.getBed().getLine().getName())
                .houseName(record.getBed().getLine().getHouse().getName())
                .plantingId(record.getPlanting() != null ? record.getPlanting().getId() : null)
                .cropName(record.getPlanting() != null ? record.getPlanting().getCrop().getName() : null)
                .recordDate(record.getRecordDate())
                .supplyEc(record.getSupplyEc())
                .supplyPh(record.getSupplyPh())
                .supplyAmount(record.getSupplyAmount())
                .drainEc(record.getDrainEc())
                .drainPh(record.getDrainPh())
                .drainAmount(record.getDrainAmount())
                .drainRate(record.getDrainRate())
                .notes(record.getNotes())
                .createdAt(record.getCreatedAt())
                .build();
    }
}
