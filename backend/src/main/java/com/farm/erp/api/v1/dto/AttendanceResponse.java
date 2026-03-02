package com.farm.erp.api.v1.dto;

import com.farm.erp.core.attendance.domain.AttendanceRecord;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AttendanceResponse {
    private Long id;
    private Long userId;
    private String userName;
    private String type;
    private LocalDateTime timestamp;
    private Long farmId;
    private String companyCode;
    private Integer weekNumber;
    private Integer workingDayIndex;
    private String status;
    private String reason;
    private String remarks;

    public static AttendanceResponse from(AttendanceRecord record) {
        return AttendanceResponse.builder()
                .id(record.getId())
                .userId(record.getUser().getId())
                .userName(record.getUser().getName())
                .type(record.getType().name())
                .timestamp(record.getTimestamp())
                .farmId(record.getFarmId())
                .companyCode(record.getCompanyCode())
                .weekNumber(record.getWeekNumber())
                .workingDayIndex(record.getWorkingDayIndex())
                .status(record.getStatus().name())
                .reason(record.getReason())
                .remarks(record.getRemarks())
                .build();
    }
}
