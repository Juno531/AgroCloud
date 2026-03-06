package com.farm.erp.core.production.dto;

import com.farm.erp.core.production.domain.WorkKeyword;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WorkKeywordResponse {
    private Long id;
    private Long farmId;
    private String name;
    private String colorCode;

    public static WorkKeywordResponse from(WorkKeyword keyword) {
        if (keyword == null)
            return null;
        return WorkKeywordResponse.builder()
                .id(keyword.getId())
                .farmId(keyword.getFarm().getId())
                .name(keyword.getName())
                .colorCode(keyword.getColorCode())
                .build();
    }
}
