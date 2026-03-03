package com.farm.erp.api.v1.dto;

import lombok.Builder;
import lombok.Getter;

/** 대시보드 - 오늘 출근 현황 응답 DTO */
@Getter
@Builder
public class DashboardAttendanceResponse {
    private int total; // 전체 직원 수
    private int present; // 오늘 출근자 수
    private int absent; // 미출근자 수
}
