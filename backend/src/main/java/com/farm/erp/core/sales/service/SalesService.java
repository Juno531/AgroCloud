package com.farm.erp.core.sales.service;

import com.farm.erp.common.exception.BusinessException;
import com.farm.erp.common.exception.ErrorCode;
import com.farm.erp.core.farm.domain.Farm;
import com.farm.erp.core.farm.repository.FarmRepository;
import com.farm.erp.core.production.domain.Crop;
import com.farm.erp.core.production.repository.CropRepository;
import com.farm.erp.core.sales.domain.Customer;
import com.farm.erp.core.sales.domain.Order;
import com.farm.erp.core.sales.domain.OrderItem;
import com.farm.erp.core.sales.domain.OrderStatus;
import com.farm.erp.core.sales.dto.CustomerRequest;
import com.farm.erp.core.sales.dto.CustomerResponse;
import com.farm.erp.core.sales.dto.OrderRequest;
import com.farm.erp.core.sales.dto.OrderResponse;
import com.farm.erp.core.sales.repository.CustomerRepository;
import com.farm.erp.core.sales.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SalesService {

    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final FarmRepository farmRepository;
    private final CropRepository cropRepository;

    // --- Customer Management ---

    @Transactional
    public CustomerResponse createCustomer(CustomerRequest request) {
        Farm farm = farmRepository.findById(request.getFarmId())
                .orElseThrow(() -> new BusinessException(ErrorCode.FARM_NOT_FOUND));

        Customer customer = Customer.builder()
                .farm(farm)
                .name(request.getName())
                .type(request.getType())
                .contactPerson(request.getContactPerson())
                .phoneNumber(request.getPhoneNumber())
                .address(request.getAddress())
                .note(request.getNote())
                .build();

        return CustomerResponse.from(customerRepository.save(customer));
    }

    public List<CustomerResponse> getCustomers(Long farmId) {
        return customerRepository.findByFarmId(farmId).stream()
                .map(CustomerResponse::from)
                .collect(Collectors.toList());
    }

    // --- Order Management ---

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Customer not found"));

        Order order = Order.builder()
                .customer(customer)
                .orderDate(request.getOrderDate())
                .deliveryDate(request.getDeliveryDate())
                .status(OrderStatus.PENDING)
                .build();

        request.getItems().forEach(itemDto -> {
            Crop crop = cropRepository.findById(itemDto.getCropId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.CROP_NOT_FOUND));

            OrderItem item = OrderItem.builder()
                    .crop(crop)
                    .grade(itemDto.getGrade())
                    .quantity(itemDto.getQuantity())
                    .unitPrice(itemDto.getUnitPrice())
                    .build();
            
            item.calculateTotalPrice();
            order.addItem(item);
        });

        return OrderResponse.from(orderRepository.save(order));
    }

    public List<OrderResponse> getOrdersByCustomer(Long customerId) {
        return orderRepository.findByCustomerId(customerId).stream()
                .map(OrderResponse::from)
                .collect(Collectors.toList());
    }
}
