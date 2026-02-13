package com.farm.erp.core.production.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BedRequest {

    private Long lineId;
    private String name;
    private Integer bedNumber;
    private Integer rowPosition;
    private Integer columnPosition;
    private Double lengthMeters;
    private Integer plantCapacity;
    private String description;
}
