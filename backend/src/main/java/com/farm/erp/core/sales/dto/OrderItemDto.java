package com.farm.erp.core.sales.dto;

import com.farm.erp.core.harvest.domain.HarvestGrade;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDto {
    @NotNull
    private Long cropId;
    
    private HarvestGrade grade;
    
    @NotNull
    @Positive
    private Integer quantity;
    
    @NotNull
    @Positive
    private BigDecimal unitPrice;
}
