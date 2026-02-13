package com.farm.erp.core.sales.repository;

import com.farm.erp.core.sales.domain.Order;
import com.farm.erp.core.sales.domain.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerId(Long customerId);
    List<Order> findByOrderDateBetween(LocalDate startDate, LocalDate endDate);
    List<Order> findByStatus(OrderStatus status);
}
