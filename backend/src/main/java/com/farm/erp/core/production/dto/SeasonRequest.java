package com.farm.erp.core.production.dto;

import jakarta.validation.constraints.NotBlank;
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
public class SeasonRequest {
    @NotNull
    private Long farmId;
    
    @NotBlank
    private String name;
    
    @NotNull
    private LocalDate startDate;
    
    private LocalDate endDate;
    private String description;
}
