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

    @NotNull(message = "Bed ID is required")
    private Long bedId;

    @NotNull(message = "Work date is required")
    private LocalDate workDate;

    @NotNull(message = "Work type is required")
    private WorkRecord.WorkType workType;

    private WorkRecord.CompletionStatus completionStatus;
    private Integer workerCount;
    private Integer durationMinutes;
    private String notes;
}
