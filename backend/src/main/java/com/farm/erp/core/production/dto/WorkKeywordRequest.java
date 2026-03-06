package com.farm.erp.core.production.dto;

import lombok.Data;

@Data
public class WorkKeywordRequest {
    private String name;
    private String colorCode;
    private Long farmId;
}
