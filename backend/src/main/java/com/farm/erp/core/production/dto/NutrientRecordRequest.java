package com.farm.erp.core.production.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NutrientRecordRequest {

    @NotNull(message = "Bed ID is required")
    private Long bedId;

    private Long plantingId; // Optional

    @NotNull(message = "Record date is required")
    private LocalDate recordDate;

    private Double supplyEc;
    private Double supplyPh;

    @Positive(message = "Supply amount must be positive")
    private Integer supplyAmount;

    private Double drainEc;
    private Double drainPh;

    @Positive(message = "Drain amount must be positive")
    private Integer drainAmount;

    private String notes;
}
