package com.farm.erp.core.production.dto;

import com.farm.erp.core.production.domain.PestRecord;
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
public class PestRecordRequest {

    @NotNull(message = "Bed ID is required")
    private Long bedId;

    @NotNull(message = "Record date is required")
    private LocalDate recordDate;

    @NotNull(message = "Pest type is required")
    private PestRecord.PestType pestType;

    private PestRecord.Severity severity;

    private String pesticideName; // 농약명
    private String applicationMethod; // 처리 방법
    private Integer affectedBedRangeStart; // 시작 베드 번호
    private Integer affectedBedRangeEnd; // 종료 베드 번호

    private String treatment; // 처리 내용
    private LocalDate treatmentDate;
}
