package com.farm.erp.core.production.dto;

import com.farm.erp.core.production.domain.House;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HouseResponse {
    private Long id;
    private String name;
    private Double area;
    private String description;
    private boolean active;

    public static HouseResponse from(House house) {
        return HouseResponse.builder()
                .id(house.getId())
                .name(house.getName())
                .area(house.getArea())
                .description(house.getDescription())
                .active(house.isActive())
                .build();
    }
}
