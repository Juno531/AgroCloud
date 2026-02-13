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
public class LineRequest {

    private Long houseId;
    private String name;
    private Integer lineNumber;
    private Integer bedCount;
    private Double lengthMeters;
    private String description;
}
