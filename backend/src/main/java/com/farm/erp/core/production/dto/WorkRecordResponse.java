package com.farm.erp.core.production.dto;

import com.farm.erp.core.production.domain.WorkRecord;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkRecordResponse {

    private Long id;
    private Long bedId;
    private String bedName;
    private Integer bedNumber;
    private String lineName;
    private LocalDate workDate;

    private WorkRecord.WorkType workType;
    private String workTypeKorean;
    private WorkRecord.CompletionStatus completionStatus;
    private String completionStatusKorean;

    private Integer workerCount;
    private Integer durationMinutes;
    private String notes;
    private LocalDateTime createdAt;

    public static WorkRecordResponse from(WorkRecord record) {
        return WorkRecordResponse.builder()
                .id(record.getId())
                .bedId(record.getBed().getId())
                .bedName(record.getBed().getName())
                .bedNumber(record.getBed().getBedNumber())
                .lineName(record.getBed().getLine().getName())
                .workDate(record.getWorkDate())
                .workType(record.getWorkType())
                .workTypeKorean(record.getWorkType().getKoreanName())
                .completionStatus(record.getCompletionStatus())
                .completionStatusKorean(record.getCompletionStatus().getKoreanName())
                .workerCount(record.getWorkerCount())
                .durationMinutes(record.getDurationMinutes())
                .notes(record.getNotes())
                .createdAt(record.getCreatedAt())
                .build();
    }
}
