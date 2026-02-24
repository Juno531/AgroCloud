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
    private List<EmployeeSummary> workers;
    private List<EmployeeSummary> leaves;

    @Getter
    @Builder
    public static class EmployeeSummary {
        private Long userId;
        private String name;
    }
}
