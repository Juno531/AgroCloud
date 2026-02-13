package com.farm.erp.core.production.dto;

import com.farm.erp.core.production.domain.HouseLayout;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HouseLayoutResponse {

    private Long id;
    private Long farmId;
    private String layoutData;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static HouseLayoutResponse from(HouseLayout houseLayout) {
        return HouseLayoutResponse.builder()
                .id(houseLayout.getId())
                .farmId(houseLayout.getFarm().getId())
                .layoutData(houseLayout.getLayoutData())
                .createdAt(houseLayout.getCreatedAt())
                .updatedAt(houseLayout.getUpdatedAt())
                .build();
    }
}
