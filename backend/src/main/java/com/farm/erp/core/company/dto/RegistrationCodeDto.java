package com.farm.erp.core.company.dto;

import com.farm.erp.core.company.domain.RegistrationCode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class RegistrationCodeDto {

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GenerateRequest {
        private Long companyId;
        private RegistrationCode.CodeType type;
        private LocalDateTime expiresAt;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private String companyName;
        private String code;
        private RegistrationCode.CodeType type;
        private RegistrationCode.CodeStatus status;
        private LocalDateTime expiresAt;
        private LocalDateTime createdAt;

        public static Response from(RegistrationCode entity) {
            return Response.builder()
                    .id(entity.getId())
                    .companyName(entity.getCompany().getName())
                    .code(entity.getCode())
                    .type(entity.getType())
                    .status(entity.getStatus())
                    .expiresAt(entity.getExpiresAt())
                    .createdAt(entity.getCreatedAt())
                    .build();
        }
    }
}
