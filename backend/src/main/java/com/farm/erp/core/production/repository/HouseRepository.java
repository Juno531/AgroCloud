package com.farm.erp.core.production.repository;

import com.farm.erp.core.production.domain.House;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HouseRepository extends JpaRepository<House, Long> {
    List<House> findByFarmId(Long farmId);

    List<House> findByFarmIdOrderByNameAsc(Long farmId);

    List<House> findByFarmIdAndActiveTrue(Long farmId);
}
