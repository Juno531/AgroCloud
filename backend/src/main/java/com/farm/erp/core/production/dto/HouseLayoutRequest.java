package com.farm.erp.core.production.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HouseLayoutRequest {

    @NotNull(message = "Farm ID is required")
    private Long farmId;

    @NotBlank(message = "Layout data is required")
    private String layoutData;
}
