package com.farm.erp.core.farm.dto;

import com.farm.erp.core.farm.domain.Farm;
import com.farm.erp.core.farm.domain.FarmStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

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
        private BigDecimal latitude;
        private BigDecimal longitude;
        private Integer attendanceRadius;
        private String attendanceStartTime;
        private String attendanceEndTime;
        private String regularEmployeeStartTime;
        private String partTimeEmployeeStartTime;
        private String companyCode;
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
                                .latitude(farm.getLatitude())
                                .longitude(farm.getLongitude())
                                .attendanceRadius(farm.getAttendanceRadius())
                                .attendanceStartTime(farm.getAttendanceStartTime() != null
                                                ? farm.getAttendanceStartTime()
                                                                .format(DateTimeFormatter.ofPattern("HH:mm"))
                                                : null)
                                .attendanceEndTime(farm.getAttendanceEndTime() != null
                                                ? farm.getAttendanceEndTime()
                                                                .format(DateTimeFormatter.ofPattern("HH:mm"))
                                                : null)
                                .regularEmployeeStartTime(farm.getRegularEmployeeStartTime() != null
                                                ? farm.getRegularEmployeeStartTime()
                                                                .format(DateTimeFormatter.ofPattern("HH:mm"))
                                                : null)
                                .partTimeEmployeeStartTime(farm.getPartTimeEmployeeStartTime() != null
                                                ? farm.getPartTimeEmployeeStartTime()
                                                                .format(DateTimeFormatter.ofPattern("HH:mm"))
                                                : null)
                                .companyCode(farm.getUser() != null && farm.getUser().getCompany() != null
                                                ? farm.getUser().getCompany().getCode()
                                                : null)
                                .createdAt(farm.getCreatedAt())
                                .updatedAt(farm.getUpdatedAt())
                                .build();
        }
}
