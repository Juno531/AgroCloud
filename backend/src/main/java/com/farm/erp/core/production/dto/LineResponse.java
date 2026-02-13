package com.farm.erp.core.production.dto;

import com.farm.erp.core.production.domain.Line;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LineResponse {

    private Long id;
    private Long houseId;
    private String houseName;
    private String name;
    private Integer lineNumber;
    private Integer bedCount;
    private Double lengthMeters;
    private boolean active;
    private String description;

    public static LineResponse from(Line line) {
        return LineResponse.builder()
                .id(line.getId())
                .houseId(line.getHouse().getId())
                .houseName(line.getHouse().getName())
                .name(line.getName())
                .lineNumber(line.getLineNumber())
                .bedCount(line.getBedCount())
                .lengthMeters(line.getLengthMeters())
                .active(line.isActive())
                .description(line.getDescription())
                .build();
    }
}
