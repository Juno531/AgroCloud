package com.farm.erp.core.sales.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerRequest {
    @NotNull
    private Long farmId;
    
    @NotBlank
    private String name;
    
    private String type;
    private String contactPerson;
    private String phoneNumber;
    private String address;
    private String note;
}
