package com.farm.erp.core.company.dto;

import com.farm.erp.core.company.domain.Company;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class CompanyDto {

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {
        private String name;
        private String code;
        private String businessNumber;
        private String address;
        private String phoneNumber;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateRequest {
        private String name;
        private String address;
        private String phoneNumber;
        private Company.CompanyStatus status;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private String name;
        private String code;
        private String businessNumber;
        private String address;
        private String phoneNumber;

        public static Response from(Company company) {
            return Response.builder()
                    .id(company.getId())
                    .name(company.getName())
                    .code(company.getCode())
                    .businessNumber(company.getBusinessNumber())
                    .address(company.getAddress())
                    .phoneNumber(company.getPhoneNumber())
                    .build();
        }
    }
}
