package com.farm.erp.core.farm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Request DTO for creating/updating a farm
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FarmRequest {

    @NotBlank(message = "Farm name is required")
    private String name;

    private String location;

    @PositiveOrZero(message = "Area must be zero or positive")
    private BigDecimal area;

    private String description;

    private String ownerName;

    private String contactNumber;
}
