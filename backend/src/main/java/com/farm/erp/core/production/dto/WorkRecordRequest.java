package com.farm.erp.core.production.dto;

import com.farm.erp.core.production.domain.WorkRecord;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkRecordRequest {

    @NotNull(message = "Farm ID is required")
    private Long farmId;

    private Long bedId;

    @NotNull(message = "Work date is required")
    private LocalDate workDate;

    private Long keywordId;

    private WorkRecord.CompletionStatus completionStatus;
    private Integer regularWorkerCount;
    private Integer dailyWorkerCount;
    private java.time.LocalTime startTime;
    private java.time.LocalTime endTime;
    private Integer durationMinutes;
    private String manager;
    private String notes;
}
