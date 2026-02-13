package com.farm.erp.api.v1;

import com.farm.erp.common.dto.ApiResponse;
import com.farm.erp.core.sales.dto.CustomerRequest;
import com.farm.erp.core.sales.dto.CustomerResponse;
import com.farm.erp.core.sales.dto.OrderRequest;
import com.farm.erp.core.sales.dto.OrderResponse;
import com.farm.erp.core.sales.service.SalesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Sales API", description = "Sales management (Customers, Orders)")
@RestController
@RequestMapping("/api/v1/sales")
@RequiredArgsConstructor
public class SalesController {

    private final SalesService salesService;

    // --- Customer Endpoints ---

    @Operation(summary = "Register a new customer")
    @PostMapping("/customers")
    public ResponseEntity<ApiResponse<CustomerResponse>> createCustomer(@Valid @RequestBody CustomerRequest request) {
        CustomerResponse response = salesService.createCustomer(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Customer registered successfully", response));
    }

    @Operation(summary = "Get customers for a farm")
    @GetMapping("/farms/{farmId}/customers")
    public ResponseEntity<ApiResponse<List<CustomerResponse>>> getCustomers(@PathVariable Long farmId) {
        List<CustomerResponse> response = salesService.getCustomers(farmId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // --- Order Endpoints ---

    @Operation(summary = "Create a new order")
    @PostMapping("/orders")
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(@Valid @RequestBody OrderRequest request) {
        OrderResponse response = salesService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Order created successfully", response));
    }

    @Operation(summary = "Get orders for a customer")
    @GetMapping("/customers/{customerId}/orders")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOrdersByCustomer(@PathVariable Long customerId) {
        List<OrderResponse> response = salesService.getOrdersByCustomer(customerId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
