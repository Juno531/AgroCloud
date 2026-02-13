package com.farm.erp.core.harvest.dto;

import com.farm.erp.core.harvest.domain.HarvestDetail;
import com.farm.erp.core.harvest.domain.HarvestRecord;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HarvestRecordResponse {
    private Long id;
    private Long seasonId;
    private String seasonName;
    private Long bedId;
    private String bedName;
    private Long cropId;
    private String cropName;
    private LocalDate harvestDate;
    private String workerName;
    private String note;
    private List<HarvestDetailDto> details;

    public static HarvestRecordResponse from(HarvestRecord record) {
        return HarvestRecordResponse.builder()
                .id(record.getId())
                .seasonId(record.getSeason().getId())
                .seasonName(record.getSeason().getName())
                .bedId(record.getBed().getId())
                .bedName(record.getBed().getName())
                .cropId(record.getCrop().getId())
                .cropName(record.getCrop().getName())
                .harvestDate(record.getHarvestDate())
                .workerName(record.getWorkerName())
                .note(record.getNote())
                .details(record.getDetails().stream()
                        .map(d -> HarvestDetailDto.builder()
                                .grade(d.getGrade())
                                .weightKg(d.getWeightKg())
                                .boxCount(d.getBoxCount())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }
}
