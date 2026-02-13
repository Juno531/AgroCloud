package com.farm.erp.core.production.dto;

import com.farm.erp.core.production.domain.Planting;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlantingResponse {
    private Long id;
    private Long seasonId;
    private String seasonName;
    private Long bedId;
    private String bedName;
    private Long cropId;
    private String cropName;
    private LocalDate plantingDate;
    private Integer plantCount;
    private LocalDate expectedHarvestDate;

    public static PlantingResponse from(Planting planting) {
        return PlantingResponse.builder()
                .id(planting.getId())
                .seasonId(planting.getSeason().getId())
                .seasonName(planting.getSeason().getName())
                .bedId(planting.getBed().getId())
                .bedName(planting.getBed().getName())
                .cropId(planting.getCrop().getId())
                .cropName(planting.getCrop().getName())
                .plantingDate(planting.getPlantingDate())
                .plantCount(planting.getPlantCount())
                .expectedHarvestDate(planting.getExpectedHarvestDate())
                .build();
    }
}
