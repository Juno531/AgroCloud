package com.farm.erp.core.production.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CropRequest {
    @NotBlank
    private String name;

    private String variety;
    private String scientificName; // Scientific name of the crop
    private Integer standardGrowthDays; // Standard growth duration in days
    private Integer growthDurationDays; // Alternative field name (deprecated)
    private String description;
}
