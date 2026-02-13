package com.farm.erp.core.production.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GrowthRecordRequest {

    @NotNull(message = "Planting ID is required")
    private Long plantingId;

    @NotNull(message = "Record date is required")
    private LocalDate recordDate;

    private Double plantHeightCm; // 초장
    private Double leafLengthCm; // 엽장
    private Double leafWidthCm; // 엽폭
    private Integer leafCount; // 엽수
    private Double crownDiameterMm; // 관부 직경
    private Integer flowerClusterCount; // 화방수

    private LocalDate floweringDate;
    private LocalDate fruitingDate;
    private Integer fruitCount;
    private String notes;
}
