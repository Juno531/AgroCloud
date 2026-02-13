package com.farm.erp.core.sales.repository;

import com.farm.erp.core.sales.domain.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    List<Customer> findByFarmId(Long farmId);
}
