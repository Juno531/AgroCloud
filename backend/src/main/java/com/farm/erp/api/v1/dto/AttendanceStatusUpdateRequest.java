package com.farm.erp.api.v1.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AttendanceStatusUpdateRequest {
    @NotBlank(message = "상태 값은 필수입니다.")
    private String status; // NORMAL, PENDING, APPROVED, REJECTED
}
