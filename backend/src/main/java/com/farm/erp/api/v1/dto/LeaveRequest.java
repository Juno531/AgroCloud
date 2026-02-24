package com.farm.erp.api.v1.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveRequest {
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate leaveDate;
    private String reason;
}
