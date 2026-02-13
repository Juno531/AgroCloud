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
public class PlantingRequest {
    @NotNull
    private Long seasonId;

    @NotNull
    private Long bedId;

    @NotNull
    private Long cropId;

    @NotNull
    private LocalDate plantingDate;

    private Integer plantCount;
    private LocalDate expectedHarvestDate;
    private String notes; // Additional notes for the planting
}
