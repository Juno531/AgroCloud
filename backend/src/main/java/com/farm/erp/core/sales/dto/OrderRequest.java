package com.farm.erp.core.sales.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequest {
    @NotNull
    private Long customerId;
    
    @NotNull
    private LocalDate orderDate;
    
    private LocalDate deliveryDate;
    
    @NotEmpty
    @Valid
    private List<OrderItemDto> items;
}
