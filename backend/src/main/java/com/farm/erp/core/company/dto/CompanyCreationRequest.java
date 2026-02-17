package com.farm.erp.core.company.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyCreationRequest {
    // Company Details
    private String companyName;
    private String companyCode;
    private String businessNumber;
    private String address;
    private String phoneNumber;

    // Admin User Details
    private String adminName;
    private String adminEmail;
    private String adminPassword;
    private String adminPhone;
}
