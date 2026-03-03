package com.farm.erp.api.v1.dto;

import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;

/** 대시보드 - 승인 대기 출근 레코드 응답 DTO */
@Getter
@Builder
public class DashboardPendingApprovalResponse {
    private Long id;
    private Long userId;
    private String userName;
    private String type; // CLOCK_IN / CLOCK_OUT
    private LocalDateTime timestamp;
    private String reason; // 사유
}
