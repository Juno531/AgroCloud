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
    private Long farmId;
    private String farmName;
    private Long bedId;
    private String bedName;
    private Integer bedNumber;
    private String lineName;
    private LocalDate workDate;

    private Long keywordId;
    private String workTypeKorean; // 프론트 하위 호환성을 위해 이름 유지
    private String keywordColorCode;
    private WorkRecord.CompletionStatus completionStatus;
    private String completionStatusKorean;

    private Integer regularWorkerCount;
    private Integer dailyWorkerCount;
    private java.time.LocalTime startTime;
    private java.time.LocalTime endTime;
    private Integer durationMinutes;
    private String manager;
    private String notes;
    private LocalDateTime createdAt;

    public static WorkRecordResponse from(WorkRecord record) {
        WorkRecordResponseBuilder builder = WorkRecordResponse.builder()
                .id(record.getId())
                .farmId(record.getFarm().getId())
                .farmName(record.getFarm().getName())
                .workDate(record.getWorkDate());

        if (record.getWorkKeyword() != null) {
            builder.keywordId(record.getWorkKeyword().getId())
                    .workTypeKorean(record.getWorkKeyword().getName())
                    .keywordColorCode(record.getWorkKeyword().getColorCode());
        } else {
            builder.workTypeKorean("미분류");
        }

        builder.completionStatus(record.getCompletionStatus())
                .completionStatusKorean(record.getCompletionStatus().getKoreanName())
                .regularWorkerCount(record.getRegularWorkerCount())
                .dailyWorkerCount(record.getDailyWorkerCount())
                .startTime(record.getStartTime())
                .endTime(record.getEndTime())
                .durationMinutes(record.getDurationMinutes())
                .manager(record.getManager())
                .notes(record.getNotes())
                .createdAt(record.getCreatedAt());

        if (record.getBed() != null) {
            builder.bedId(record.getBed().getId())
                    .bedName(record.getBed().getName())
                    .bedNumber(record.getBed().getBedNumber())
                    .lineName(record.getBed().getLine().getName());
        }

        return builder.build();
    }
}
