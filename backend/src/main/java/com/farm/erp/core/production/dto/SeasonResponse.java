package com.farm.erp.core.production.dto;

import com.farm.erp.core.production.domain.Season;
import com.farm.erp.core.production.domain.SeasonStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeasonResponse {
    private Long id;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private SeasonStatus status;
    private String description;

    public static SeasonResponse from(Season season) {
        return SeasonResponse.builder()
                .id(season.getId())
                .name(season.getName())
                .startDate(season.getStartDate())
                .endDate(season.getEndDate())
                .status(season.getStatus())
                .description(season.getDescription())
                .build();
    }
}
