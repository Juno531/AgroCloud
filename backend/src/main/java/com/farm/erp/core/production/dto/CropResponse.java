package com.farm.erp.core.production.dto;

import com.farm.erp.core.production.domain.Crop;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CropResponse {
    private Long id;
    private String name;
    private String variety;
    private Integer growthDurationDays;
    private String description;

    public static CropResponse from(Crop crop) {
        return CropResponse.builder()
                .id(crop.getId())
                .name(crop.getName())
                .variety(crop.getVariety())
                .growthDurationDays(crop.getGrowthDurationDays())
                .description(crop.getDescription())
                .build();
    }
}
