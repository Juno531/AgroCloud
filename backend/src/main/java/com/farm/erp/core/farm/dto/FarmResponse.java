package com.farm.erp.core.farm.dto;

import com.farm.erp.core.farm.domain.Farm;
import com.farm.erp.core.farm.domain.FarmStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Response DTO for farm data
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FarmResponse {
    
    private Long id;
    private String name;
    private String location;
    private BigDecimal area;
    private FarmStatus status;
    private String description;
    private String ownerName;
    private String contactNumber;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    /**
     * Convert from Entity to DTO
     */
    public static FarmResponse from(Farm farm) {
        return FarmResponse.builder()
            .id(farm.getId())
            .name(farm.getName())
            .location(farm.getLocation())
            .area(farm.getArea())
            .status(farm.getStatus())
            .description(farm.getDescription())
            .ownerName(farm.getOwnerName())
            .contactNumber(farm.getContactNumber())
            .createdAt(farm.getCreatedAt())
            .updatedAt(farm.getUpdatedAt())
            .build();
    }
}
