package com.farm.erp.core.sales.domain;

import com.farm.erp.core.farm.domain.Farm;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

/**
 * Customer (거래처) Entity
 * Represents a buyer (e.g., Local Mart, Coupang, Individual)
 */
@Entity
@Table(name = "customers")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id", nullable = false)
    private Farm farm;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 20)
    private String type; // e.g., "WHOLESALE", "RETAIL", "ONLINE"

    @Column(name = "contact_person")
    private String contactPerson;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(length = 200)
    private String address;

    @Column(length = 500)
    private String note;
}
