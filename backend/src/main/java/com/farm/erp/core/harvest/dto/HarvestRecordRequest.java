package com.farm.erp.core.harvest.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HarvestRecordRequest {
    @NotNull
    private Long seasonId;
    
    @NotNull
    private Long bedId;
    
    @NotNull
    private Long cropId;
    
    @NotNull
    private LocalDate harvestDate;
    
    private String workerName;
    private String note;
    
    @NotEmpty
    @Valid
    private List<HarvestDetailDto> details;
}
