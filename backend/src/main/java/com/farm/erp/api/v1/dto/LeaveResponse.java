package com.farm.erp.api.v1.dto;

import com.farm.erp.core.attendance.domain.LeaveRecord;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDate;

@Getter
@Builder
public class LeaveResponse {
    private Long id;
    private Long userId;
    private LocalDate leaveDate;
    private String reason;

    public static LeaveResponse from(LeaveRecord record) {
        return LeaveResponse.builder()
                .id(record.getId())
                .userId(record.getUser().getId())
                .leaveDate(record.getLeaveDate())
                .reason(record.getReason())
                .build();
    }
}
