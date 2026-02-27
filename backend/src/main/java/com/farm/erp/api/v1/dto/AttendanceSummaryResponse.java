package com.farm.erp.api.v1.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
public class AttendanceSummaryResponse {
    private LocalDate date;
    private int workerCount;
    private int leaveCount;
    private int absenteeCount;
    private int fullTimeScheduledCount; // 정규직 근무예정자 수
    private int partTimeScheduledCount; // 비정규직 근무예정자 수
    private List<EmployeeSummary> workers;
    private List<EmployeeSummary> leaves;
    private List<EmployeeSummary> absentees;
    // 근무예정자: 전체직원 중 휴무자를 제외한 사람 (고용형태별)
    private List<EmployeeSummary> scheduledWorkers;

    @Getter
    @Builder
    public static class EmployeeSummary {
        private Long userId;
        private String name;
        private String employmentType; // FULL_TIME / PART_TIME
    }
}
