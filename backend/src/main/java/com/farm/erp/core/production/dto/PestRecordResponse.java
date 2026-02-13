package com.farm.erp.core.production.dto;

import com.farm.erp.core.production.domain.PestRecord;
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
public class PestRecordResponse {

    private Long id;
    private Long bedId;
    private String bedName;
    private LocalDate recordDate;

    private PestRecord.PestType pestType;
    private String pestTypeKorean;
    private PestRecord.Severity severity;
    private String severityKorean;

    private String pesticideName;
    private String applicationMethod;
    private Integer affectedBedRangeStart;
    private Integer affectedBedRangeEnd;

    private String treatment;
    private LocalDate treatmentDate;
    private LocalDateTime createdAt;

    public static PestRecordResponse from(PestRecord record) {
        return PestRecordResponse.builder()
                .id(record.getId())
                .bedId(record.getBed().getId())
                .bedName(record.getBed().getName())
                .recordDate(record.getRecordDate())
                .pestType(record.getPestType())
                .pestTypeKorean(record.getPestType().getKoreanName())
                .severity(record.getSeverity())
                .severityKorean(record.getSeverity() != null ? record.getSeverity().getKoreanName() : null)
                .pesticideName(record.getPesticideName())
                .applicationMethod(record.getApplicationMethod())
                .affectedBedRangeStart(record.getAffectedBedRangeStart())
                .affectedBedRangeEnd(record.getAffectedBedRangeEnd())
                .treatment(record.getTreatment())
                .treatmentDate(record.getTreatmentDate())
                .createdAt(record.getCreatedAt())
                .build();
    }
}
