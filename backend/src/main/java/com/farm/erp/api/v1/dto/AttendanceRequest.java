package com.farm.erp.api.v1.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AttendanceRequest {
    private String type; // "CLOCK_IN" or "CLOCK_OUT"
    private Long farmId;
    private String companyCode;
}
