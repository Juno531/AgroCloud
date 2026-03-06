package com.farm.erp.api.v1.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class AttendanceUpdateRequest {
    private LocalDateTime timestamp;
    private String status; // NORMAL, PENDING, APPROVED, REJECTED, etc.
    private String reason;
}
