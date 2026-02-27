package com.farm.erp.api.v1.dto;

import com.farm.erp.core.hr.domain.EmploymentType;
import lombok.Getter;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class AttendanceFilterRequest {
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private LocalDateTime startDate;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    private LocalDateTime endDate;

    private List<EmploymentType> employmentTypes;

    private List<String> statuses; // CLOCK_IN, CLOCK_OUT, etc.

    private List<Long> clockInFarmIds;

    private List<Long> clockOutFarmIds;

    private List<Long> userIds;

    private String searchTerm;

    private String companyCode;
}
