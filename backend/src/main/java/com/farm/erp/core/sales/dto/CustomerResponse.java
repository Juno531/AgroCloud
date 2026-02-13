package com.farm.erp.core.sales.dto;

import com.farm.erp.core.sales.domain.Customer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerResponse {
    private Long id;
    private String name;
    private String type;
    private String contactPerson;
    private String phoneNumber;
    private String address;
    private String note;

    public static CustomerResponse from(Customer customer) {
        return CustomerResponse.builder()
                .id(customer.getId())
                .name(customer.getName())
                .type(customer.getType())
                .contactPerson(customer.getContactPerson())
                .phoneNumber(customer.getPhoneNumber())
                .address(customer.getAddress())
                .note(customer.getNote())
                .build();
    }
}
