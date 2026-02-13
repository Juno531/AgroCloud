package com.farm.erp.core.production.repository;

import com.farm.erp.core.production.domain.HouseLayout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HouseLayoutRepository extends JpaRepository<HouseLayout, Long> {
    Optional<HouseLayout> findByFarmId(Long farmId);

    boolean existsByFarmId(Long farmId);
}
