package com.farm.erp.core.production.repository;

import com.farm.erp.core.production.domain.Planting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlantingRepository extends JpaRepository<Planting, Long> {
    List<Planting> findBySeasonId(Long seasonId);

    List<Planting> findByBedId(Long bedId);

    List<Planting> findBySeasonIdAndBedId(Long seasonId, Long bedId);

    List<Planting> findByBed_Line_House_FarmId(Long farmId);
}
