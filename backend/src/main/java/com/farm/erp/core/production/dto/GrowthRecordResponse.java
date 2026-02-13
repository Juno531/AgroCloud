package com.farm.erp.core.production.dto;

import com.farm.erp.core.production.domain.GrowthRecord;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GrowthRecordResponse {

    private Long id;
    private Long plantingId;
    private String cropName;
    private LocalDate recordDate;

    private Double plantHeightCm;
    private Double leafLengthCm;
    private Double leafWidthCm;
    private Integer leafCount;
    private Double crownDiameterMm;
    private Integer flowerClusterCount;

    private LocalDate floweringDate;
    private LocalDate fruitingDate;
    private Integer fruitCount;
    private String notes;
    private LocalDateTime createdAt;

    public static GrowthRecordResponse from(GrowthRecord record) {
        return GrowthRecordResponse.builder()
                .id(record.getId())
                .plantingId(record.getPlanting().getId())
                .cropName(record.getPlanting().getCrop().getName())
                .recordDate(record.getRecordDate())
                .plantHeightCm(record.getPlantHeightCm())
                .leafLengthCm(record.getLeafLengthCm())
                .leafWidthCm(record.getLeafWidthCm())
                .leafCount(record.getLeafCount())
                .crownDiameterMm(record.getCrownDiameterMm())
                .flowerClusterCount(record.getFlowerClusterCount())
                .floweringDate(record.getFloweringDate())
                .fruitingDate(record.getFruitingDate())
                .fruitCount(record.getFruitCount())
                .notes(record.getNotes())
                .createdAt(record.getCreatedAt())
                .build();
    }
}
