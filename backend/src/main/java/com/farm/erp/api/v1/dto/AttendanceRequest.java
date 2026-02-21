package com.farm.erp.api.v1.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AttendanceRequest {
    @NotBlank(message = "출퇴근 타입은 필수입니다.")
    private String type; // "CLOCK_IN" or "CLOCK_OUT"

    @NotNull(message = "농장 ID는 필수입니다.")
    private Long farmId;

    private String companyCode;

    @NotNull(message = "위도 정보는 필수입니다.")
    private java.math.BigDecimal latitude;

    @NotNull(message = "경도 정보는 필수입니다.")
    private java.math.BigDecimal longitude;
}
