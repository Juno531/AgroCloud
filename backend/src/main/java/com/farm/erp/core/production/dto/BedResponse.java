package com.farm.erp.core.production.dto;

import com.farm.erp.core.production.domain.Bed;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BedResponse {

    private Long id;
    private Long lineId;
    private String lineName;
    private String name;
    private Integer bedNumber;
    private Integer rowPosition;
    private Integer columnPosition;
    private Double lengthMeters;
    private Integer plantCapacity;
    private boolean active;
    private String description;

    public static BedResponse from(Bed bed) {
        return BedResponse.builder()
                .id(bed.getId())
                .lineId(bed.getLine().getId())
                .lineName(bed.getLine().getName())
                .name(bed.getName())
                .bedNumber(bed.getBedNumber())
                .rowPosition(bed.getRowPosition())
                .columnPosition(bed.getColumnPosition())
                .lengthMeters(bed.getLengthMeters())
                .plantCapacity(bed.getPlantCapacity())
                .active(bed.isActive())
                .description(bed.getDescription())
                .build();
    }
}
