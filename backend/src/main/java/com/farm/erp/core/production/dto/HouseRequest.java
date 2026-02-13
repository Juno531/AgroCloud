package com.farm.erp.core.production.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HouseRequest {
    @NotNull
    private Long farmId;

    @NotBlank
    private String name;

    private String houseType; // Type of greenhouse (e.g., "단동", "연동", etc.)
    private Double width; // Width in meters
    private Double length; // Length in meters
    private Double area;
    private String description;
}
