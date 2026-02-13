package com.farm.erp.core.sales.dto;

import com.farm.erp.core.sales.domain.Order;
import com.farm.erp.core.sales.domain.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private Long customerId;
    private String customerName;
    private LocalDate orderDate;
    private LocalDate deliveryDate;
    private OrderStatus status;
    private BigDecimal totalAmount;
    private List<OrderItemResponse> items;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class OrderItemResponse {
        private Long cropId;
        private String cropName;
        private String grade;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
    }

    public static OrderResponse from(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .customerId(order.getCustomer().getId())
                .customerName(order.getCustomer().getName())
                .orderDate(order.getOrderDate())
                .deliveryDate(order.getDeliveryDate())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .items(order.getItems().stream()
                        .map(item -> OrderItemResponse.builder()
                                .cropId(item.getCrop().getId())
                                .cropName(item.getCrop().getName())
                                .grade(item.getGrade() != null ? item.getGrade().name() : null)
                                .quantity(item.getQuantity())
                                .unitPrice(item.getUnitPrice())
                                .totalPrice(item.getTotalPrice())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }
}
