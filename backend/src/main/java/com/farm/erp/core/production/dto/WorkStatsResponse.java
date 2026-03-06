package com.farm.erp.core.production.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class WorkStatsResponse {
    private double completionRate;
    private long totalTasks;
    private long completedTasks;
    private long totalManHours;
    private List<KeywordStat> keywordStats;

    @Data
    @Builder
    public static class KeywordStat {
        private String keywordName;
        private String colorCode;
        private long count;
        private double percentage;
    }
}
